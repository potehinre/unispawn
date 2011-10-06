import tornado.ioloop
import tornado.web
from tornado.httpclient import AsyncHTTPClient,HTTPClient

class MainHandler(tornado.web.RequestHandler):
    urls={"news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=238&count=1",
          "comments":"http://www.sports.ru/stat/export/wapsports/news_comments.json?id=112146357&count=1",
	  "blogs":"http://www.sports.sru/stat/export/wapsports/blogs.json?category_id=23",
          "conferences":"http://www.sports.sru/stat/export/wapsports/conferences.json?category_id=23"}

    def get(self):
        for urlname,url in self.urls.items():
            client = AsyncHTTPClient()
            resp = client.fetch(url,self.handle_request)
            print 'Resp is',resp
        self.write("Hello, World")
    
    def handle_request(self,response):
        print response.body

application = tornado.web.Application([
    (r"/", MainHandler),
])

if __name__ == '__main__':
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
