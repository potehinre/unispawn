import ujson,cjson,httplib2
import gevent_aggregator
import cProfile
import time
from markupsafe import Markup
from gevent.wsgi import WSGIServer

from flask import Flask,url_for,render_template,abort
app = Flask(__name__)
app.config.from_object(__name__)

def timeit(opname):
    def wrapper(fn):
        def temp(*args,**kwargs):
            before = time.time()
            result = fn(*args,**kwargs)
            print opname," taken ",time.time()-before," s"
            return result
        return temp
    return wrapper
   

def profile_info(urls):
    content = async_collect(urls)
    context=ujson_decode(content)
    print 'Sync collect profile:'
    cProfile.runctx('sync_collect(urls)',globals(),locals())
    print 'Async collect profile:'
    cProfile.runctx('async_collect(urls)',globals(),locals())
    print 'Cjson profile:'
    cProfile.runctx('cjson_decode(content)',globals(),locals())
    print 'Ujson profile:'
    cProfile.runctx('ujson_decode(content)',globals(),locals())   
    print 'Jinja profile:'
    cProfile.runctx("""jinja_template('index',context)""",globals(),locals())
    
    
@timeit("cjsoning")
def cjson_decode(content):
    return cjson.decode(content)

@timeit("ujsoning")
def ujson_decode(content):
    return ujson.decode(content)

def sync_collect(urls):
    return gevent_aggregator.sync_collect(urls)

@timeit("collecting")
def async_collect(urls):
    return gevent_aggregator.collect(urls)

@timeit("jinjaing")
def jinja_template(name,context):
    return render_template(name+".html",**context)

@app.route("/favicon.ico")
def favicon():
	abort(404)
	
def construct_page(urls,name):
    content = async_collect(urls) 
    context = ujson_decode(content)
    template = jinja_template(name,context)
    return template

@app.route("/")
def index():
    name="main"
    real_urls = {
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
    fake_urls= {
        "main_news":"http://localhost:100/main_news.json",
        "football_news":"http://localhost:100/football_news.json",
        "hockey_news":"http://localhost:100/hockey_news.json",
        "basket_news":"http://localhost:100/basket_news.json",
        "automoto_news":"http://localhost:100/automoto_news.json",
        "boxing_news":"http://localhost:100/boxing_news.json",
        "tennis_news":"http://localhost:100/tennis_news.json",
        "biathlon_news":"http://localhost:100/biathlon_news.json",
        "other_news":"http://localhost:100/other_news.json",
        "style_news":"http://localhost:100/style_news.json",
        "blogs":"http://localhost:100/blogs.json",
        "conferences":"http://localhost:100/conferences.json",
        "materials":"http://localhost:100/materials.json"
    }
    return construct_page(fake_urls,name)

@app.route("/tribuna/blogs/<name>/<id>")
def blog(name, id):
    result={}
    post=ujson_decode(async_collect({"post":"http://www.sports.ru/stat/export/wapsports/blog_post.json?id=%s"% (id,)}))
    result.update(post)
    if post['post']['data']:
	category_id=post['post']['data']['category_id']
	urls={"posts":"http://www.sports.ru/stat/export/wapsports/blog_posts.json?blog_name=%s&count=10"%(name,),
	      "blog_post_comments":"http://www.sports.ru/stat/export/wapsports/blog_post_comments.json?id=%s&count=10"%(id,),
	      "category_blog_popular_posts":"http://www.sports.ru/stat/export/wapsports/category_blog_popular_posts.json?category_id=%s&count=10"%(category_id,),
	      "materials":"http://www.sports.ru/stat/export/wapsports/materials.json?category_id=%s&count=5"%(category_id,)}
	content=async_collect(urls)
	other_info=ujson_decode(content)
	result.update(other_info)
	template=jinja_template("cur_blog",result)
	return template
    

if __name__ == "__main__":
    #http_server = WSGIServer(('',5000),app)
    #http_server.serve_forever()
    app.debug = True
    app.run()
