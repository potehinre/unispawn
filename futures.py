#-*- coding:utf-8 -*-
import gevent
import httplib2
import ujson
import functools
from gevent import monkey
monkey.patch_all()
import re

class DependencyError(Exception):
    pass

class Future(object):
    def __init__(self,urlname,timeout=300,text_replacer=None,json_replacer=None,**params):
        self.url = urlname
        self.timeout = timeout
        self.params = params
        self.text_replacer=text_replacer
        self.json_replacer=json_replacer
        self.greenlet = gevent.Greenlet(self._do_work)
        self.greenlet.start()
        
    def _do_work(self):
        timeout = gevent.Timeout(self.timeout)
        timeout.start()
        try:
            htt = httplib2.Http(timeout=self.timeout)
            dep_greenlets = [param.greenlet for param in self.params if isinstance(param,Future)]
            gevent.joinall(dep_greenlets)
            if any('error' in parameter for parameter in self.params.values() if isinstance(parameter,dict)):
                return {"error":"Dependency Failed"}
            url = self.url.format(**self.params)
            response,content = htt.request(url)
            if self.text_replacer:
                content = self.text_replacer(content)
            return {"data":(ujson.decode(content) if not self.json_replacer else walk_recursive(ujson.decode(content),self.json_replacer))}
        except Exception as e:
            print e
            return {"error":e.message}
        except gevent.Timeout,t:
            return {'error':'timeout'}
        finally:
            timeout.cancel()
    
    def __getattr__(self,attrname):
        gevent.joinall([self.greenlet])
        if attrname == 'data':
            return self.greenlet.value
    
    def __getitem__(self,itemname):
        gevent.joinall([self.greenlet])
        if 'data' in self.greenlet.value:
            return self.greenlet.value['data'][itemname]
        else:
            return {"error":self.greenlet.value['error']}
    
    def kill(self):
        self.greenlet.kill()

        
class CriticalFuture(Future):
    def __getattr__(self,attrname):
        gevent.joinall([self.greenlet])
        if attrname == 'data' and ('data' in self.greenlet.value):
            return self.greenlet.value
        else:
            raise DependencyError("Dependency Failed"+self.greenlet.value['error'])
    
    def __getitem__(self,itemname):
        print 'collector ',self.urlname,' joining ',itemname
        gevent.joinall([self.greenlet])
        if 'data' in self.greenlet.value:
            return  ujson.decode(self.greenlet.value['data'])[itemname]
        else:
            raise DependencyError("Dependency Failed:"+self.greenlet.value['error'])
    

def joinall(f):
    @functools.wraps(f)
    def wrapper(*args,**kwargs):
        futures = None
        try:
            futures = f(*args,**kwargs)
            gevent.joinall([future.greenlet for future in futures.values() if isinstance(future,Future)])
            return dict((name,fut.data) for name,fut in futures.items() if isinstance(fut,Future))
        except DependencyError as e:
            return "Dependency Failed"
    return wrapper

def nginx_ssi(text):
    pattern = r"<!--#include virtual=(.*?)-->"
    repl_pattern = r"<!--#include virtual=%s-->"
    urls = re.findall(pattern,text)
    replacements = dict.fromkeys(urls)
    for url in urls:
        htt = httplib2.Http()
        response,content = htt.request(url)
        if response['status'] == "200":
            replacements[url] = content
    new_text = text
    for url,replacement in replacements.items():
        new_text = new_text.replace(repl_pattern%(url,),replacement)
    return new_text


def get_json(url):
    """
      Запрашивает по урлу JSON и десереализует его
    """
    htt = httplib2.Http()
    response,content = htt.request(url)
    return ujson.decode(content)

def json_ssi(element):
    split_regex = r"(<!--#json include=.*?-->)" 
    url_regex = r"<!--#json include=(.*?)-->"
    result = re.split(split_regex,element)
    if len(result) == 1:
        return result[0]
    else:
        for i in range(len(result)):
            urls = re.findall(url_regex,result[i])
            for url in urls:
                result[i] = get_json(url)
    return result

def walk_recursive(element,f):
    """
    Рекурсивно обходит дерево преобразуя все встреченые строки 
    функцией f
    """
    if isinstance(element,list):
        for i,el in enumerate(element):
            if isinstance(el,str) or isinstance(el,unicode):
                element[i] = f(el)
            else:
                walk_recursive(el,f)
    elif isinstance(element,dict):
        for key,item in element.items():
            if isinstance(item,str) or isinstance(item,unicode):
                element[key] = f(item)
            else:
                walk_recursive(item,f)
    return element
                
                
@joinall
def blog_post_page():
    post = Future("http://www.sports.ru/stat/export/wapsports/blog_post.json?id={id}",timeout=10,id=326627)
    ssi  = Future("http://localhost:100/ssi_document.json",text_replacer=nginx_ssi)
    jssi = Future("http://localhost:100/ssi_json.json",json_replacer=json_ssi)
    return locals()
        
    
    
if __name__ == "__main__":
    data = blog_post_page()
    print data
    #print data