import jinja2,cjson,httplib2
import gevent_aggregator
import time
from gevent.wsgi import WSGIServer

from flask import Flask,url_for,render_template,abort
app = Flask(__name__)
app.config.from_object(__name__)

@app.route("/favicon.ico")
def favicon():
	abort(404)

@app.route("/")
def index():
    before=time.time()
    name="index"
    urls = {
        "main_news":"http://www.sports.ru/stat/export/wapsports/mainnews.json?count=6",
        "football_news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=208&count=6",
        "hockey_news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=209&count=6",
        "basket_news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=210&count=6",
        "automoto_news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=227&count=6",
        "boxing_news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=213&count=6",
        "tennis_news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=212&count=6",
        "biathlon_news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=225&count=6",
        "other_news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=256&count=6",
        "style_news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=111163733&count=6",
        "blogs":"http://www.sports.ru/stat/export/wapsports/blogs.json?count=6",
        "conferences":"http://www.sports.ru/stat/export/wapsports/conferences.json?count=6",
        "materials":"http://www.sports.ru/stat/export/wapsports/materials.json?count=6"}
    content = gevent_aggregator.collect(urls)
    print "Time for requests",time.time()-before
    before=time.time()
    context = cjson.decode(content)
    print "Time for jsoning",time.time()-before
    before=time.time()
    template = render_template(name+".html",**context)
    print "Time for template rendering",time.time()-before
    return template

#if __name__ == "__main__":
#    http_server = WSGIServer(('',5000),app)
#    http_server.serve_forever()
