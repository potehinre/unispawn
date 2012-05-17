import gevent
import httplib2
import ujson
from gevent import monkey
monkey.patch_all()


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
            print 'requested:',url
            return content
        except gevent.Timeout,t:
            result = (self.url, ('error', 'timeout'))
        finally:
            timeout.cancel()
            
    def __getattr__(self,attrname):
        gevent.joinall([self.greenlet])
        return getattr(ujson.decode(self.greenlet.value),attrname)
    
    def __getitem__(self,itemname):
        gevent.joinall([self.greenlet])
        print 'joined',self.url
        return  ujson.decode(self.greenlet.value)[itemname]
    
    
if __name__ == "__main__":
    post = Future("http://www.sports.ru/stat/export/wapsports/blog_post.json?id={id}",timeout=10,id=326627)
    blog = Future("http://www.sports.ru/stat/export/wapsports/blog_post.json?name={name}",timeout=10,name="whitegames")
    category_posts = Future("http://www.sports.ru/stat/export/wapsports/category_blog_popular_posts.json?category_id={post_category_id}&count=10",
                            timeout=10,post_category_id=post['blog_id'])
    category_posts['total_count']