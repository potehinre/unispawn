import gevent
import httplib2
import ujson
import functools
from gevent import monkey
monkey.patch_all()

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
            print 'ITEMNAME',itemname
            print 'VALUE',self.greenlet.value
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

@joinall
def blog_post_page():
    haha = Future("http://www.dsjajdf.ru?id={id}",timeout=10,id=234)
    post = Future("http://www.sports.ru/stat/export/wapsports/blog_post.json?id={id}",timeout=10,id=326627)
    category_posts = Future("http://www.sports.ru/stat/export/wapsports/category_blog_popular_posts.json?category_id={post_category_id}&count=10",
                            timeout=10,post_category_id=haha['blog_id'])
    return locals()
        
    
    
if __name__ == "__main__":
    data = blog_post_page()
    print data