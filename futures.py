import gevent
import httplib2
import ujson
import functools
from gevent import monkey
monkey.patch_all()

class DependencyError(Exception):
    pass

class Future(object):
    def __init__(self,urlname,timeout,**params):
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
            url = self.url.format(**self.params)
            response,content = htt.request(url)
            return {"result":content}
        except Exception as e:
            return {"error":e.message}
        except gevent.Timeout,t:
            result = (self.url, ('error', 'timeout'))
        finally:
            timeout.cancel()
    
    def __getattr__(self,attrname):
        gevent.joinall([self.greenlet])
        if attrname == 'result' and ('result' in self.greenlet.value):
            return self.greenlet.value['result']
    
    def __getitem__(self,itemname):
        gevent.joinall([self.greenlet])
        return ujson.decode(self.greenlet.value['result'])[itemname]
    
    def kill(self):
        self.greenlet.kill()

        
class CriticalFuture(Future):
    def __getattr__(self,attrname):
        gevent.joinall([self.greenlet])
        if attrname == 'result' and ('result' in self.greenlet.value):
            return ujson.decode(self.greenlet.value['result'])
        else:
            raise DependencyError("Dependency Failed"+self.greenlet.value['error'])
    
    def __getitem__(self,itemname):
        gevent.joinall([self.greenlet])
        if 'result' in self.greenlet.value:
            return  ujson.decode(self.greenlet.value['result'])[itemname]
        else:
            raise DependencyError("Dependency Failed:"+self.greenlet.value['error'])
    

def joinall(f):
    @functools.wraps(f)
    def wrapper(*args,**kwargs):
        try:
            futures = f(*args,**kwargs)
            return [fut.result for fut in futures.values()]
        except DependencyError as e:
            return "Collection Failed"
        finally:
            for fut in futures.values():
                fut.kill()
    return wrapper

@joinall
def blog_post_page():
    haha = CriticalFuture("http://www.dsjajdf.ru?id={id}",timeout=10,id=234)
    post = Future("http://www.sports.ru/stat/export/wapsports/blog_post.json?id={id}",timeout=10,id=326627)
    category_posts = Future("http://www.sports.ru/stat/export/wapsports/category_blog_popular_posts.json?category_id={post_category_id}&count=10",
                            timeout=10,post_category_id=post['blog_id'])
    return locals()
        
    
    
if __name__ == "__main__":
    result = blog_post_page()
    print result