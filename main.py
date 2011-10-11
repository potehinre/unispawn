import jinja2,cjson,httplib2
import gevent_aggregator
from gevent.wsgi import WSGIServer

from flask import Flask,url_for,render_template,abort
app = Flask(__name__)
app.config.from_object(__name__)

@app.route("/favicon.ico")
def favicon():
	abort(404)

@app.route("/")
def index():
    name="index"
    urls = {
        "main_news":"http://www.sports.ru/stat/export/wapsports/mainnews.json?count=7",
        "football_news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=208&count=5",
        "hockey_news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=209&count=5",
        "basket_news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=210&count=5",
        "automoto_news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=227&count=5",
        "boxing_news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=213&count=5",
        "tennis_news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=212&count=5",
        "biathlon_news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=225&count=5",
        "other_news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=256&count=5",
        "style_news":"http://www.sports.ru/stat/export/wapsports/news.json?category_id=111163733&count=5",
        "blogs":"http://www.sports.ru/stat/export/wapsports/blogs.json?count=13",
        "conferences":"http://www.sports.ru/stat/export/wapsports/conferences.json?count=5",
        "materials":"http://www.sports.ru/stat/export/wapsports/materials.json?count=4"}
    content = gevent_aggregator.collect(urls)
    context = cjson.decode(content)
    return render_template(name+".html",**context)
    

#if __name__ == "__main__":
#    http_server = WSGIServer(('',5000),app)
#    http_server.serve_forever()
