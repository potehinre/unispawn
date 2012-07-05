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
    def __init__(self,urlname,timeout=300,**params):
        self.url = urlname
        self.timeout = timeout
        self.params = params
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
            content = ssi(content)
            return {"data":ujson.decode(content)}
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

def ssi(text):
    pattern = "<!--#include virtual=(.*?)-->"
    repl_pattern = "<!--#include virtual=%s-->"
    urls = re.findall(pattern,text)
    print urls
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
        

@joinall
def blog_post_page():
    post = Future("http://www.sports.ru/stat/export/wapsports/blog_post.json?id={id}",timeout=10,id=326627)
    ssi  = Future("http://localhost:100/ssi_document.json")
    return locals()
        
    
    
if __name__ == "__main__":
    data = blog_post_page()
    print data
    #print data