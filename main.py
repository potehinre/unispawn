import ujson,cjson,httplib2
import gevent_aggregator
import cProfile
import time
from markupsafe import Markup
from gevent.wsgi import WSGIServer
from futures import Future,joinall
import pyjade

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
    before = time.time()
    aggr = gevent_aggregator.DependencyAggregator(urls)
    print "Aggregator creating:",time.time() - before
    before = time.time()
    context = aggr.collect()
    print "Collecting:",time.time() - before
    template = jinja_template(name,context)
    return template

@app.route("/tribuna/<name>/<id>")
def blog(name, id):
    urls={"post":"http://www.sports.ru/stat/export/wapsports/blog_post.json?id=%s"% (id,),
	  "posts":"http://www.sports.ru/stat/export/wapsports/blog_posts.json?blog_name=%s&count=10"%(name,),
	  "blog_post_comments":"http://www.sports.ru/stat/export/wapsports/blog_post_comments.json?id=%s&count=10"%(id,),
	  "category_blog_popular_posts":"http://www.sports.ru/stat/export/wapsports/category_blog_popular_posts.json?category_id={{post.category_id}}&count=10",
	  "materials":"http://www.sports.ru/stat/export/wapsports/materials.json?category_id={{post.category_id}}&count=5"}
    return construct_page(urls,"cur_blog")

@app.route("/jade/")
def index_on_jade():
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
        before = time.time()
        aggr = gevent_aggregator.DependencyAggregator(fake_urls)
        print "Aggregator creating:",time.time() - before
        before = time.time()
        context = aggr.collect()
        print "Collecting:",time.time() - before
        before = time.time()
        result = render_template("jade/main.jade",**context)
        after = time.time() - before
        print 'Rendering:',after
        return result

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
    return construct_page(real_urls,name)

@app.route("/futures/main")
def futures_index():
    name = "main"
    @joinall
    def construct_index():
        main_news = Future("http://www.sports.ru/stat/export/wapsports/mainnews.json?count=6")
        football_news = Future("http://www.sports.ru/stat/export/wapsports/news.json?category_id=208&count=6")
        hockey_news = Future("http://www.sports.ru/stat/export/wapsports/news.json?category_id=209&count=6")
        basket_news = Future("http://www.sports.ru/stat/export/wapsports/news.json?category_id=210&count=6")
        automoto_news = Future("http://www.sports.ru/stat/export/wapsports/news.json?category_id=227&count=6")
        boxing_news = Future("http://www.sports.ru/stat/export/wapsports/news.json?category_id=213&count=6")
        tennis_news = Future("http://www.sports.ru/stat/export/wapsports/news.json?category_id=212&count=6")
        biathlon_news = Future("http://www.sports.ru/stat/export/wapsports/news.json?category_id=225&count=6")
        other_news = Future("http://www.sports.ru/stat/export/wapsports/news.json?category_id=256&count=6")
        style_news = Future("http://www.sports.ru/stat/export/wapsports/news.json?category_id=111163733&count=6")
        blogs = Future("http://www.sports.ru/stat/export/wapsports/blogs.json?count=6")
        conferences = Future("http://www.sports.ru/stat/export/wapsports/conferences.json?count=6")
        materials = Future("http://www.sports.ru/stat/export/wapsports/materials.json?count=6")
        return locals()
    
    @joinall
    def construct_index_fake():
         main_news = Future("http://localhost:100/main_news.json")
         football_news = Future("http://localhost:100/football_news.json")
         hockey_news = Future("http://localhost:100/hockey_news.json")
         basket_news = Future("http://localhost:100/basket_news.json")
         automoto_news = Future("http://localhost:100/automoto_news.json")
         boxing_news = Future("http://localhost:100/boxing_news.json")
         tennis_news = Future("http://localhost:100/tennis_news.json")
         biathlon_news = Future("http://localhost:100/biathlon_news.json")
         other_news = Future("http://localhost:100/other_news.json")
         style_news = Future("http://localhost:100/style_news.json")
         blogs = Future("http://localhost:100/blogs.json")
         conferences = Future("http://localhost:100/conferences.json")
         materials = Future("http://localhost:100/materials.json")
         return locals()
     
    @joinall
    def construct_index_2_futures():
        main_news = Future("http://www.sports.ru/stat/export/wapsports/mainnews.json?count=1")
        football_news = Future("http://www.sports.ru/stat/export/wapsports/news.json?category_id=208&count=1")
        return locals()
     
    before = time.time()
    context = construct_index()
    print 'Futures collection:',time.time() - before
    result = {"context":context,"template":"templates/jade/main.jade"}
    template = ujson.encode(result)
    return template

@app.route("/futures/tribuna/<name>/<blog_id>")
def futures_blog(name,blog_id):
    @joinall
    def construct():
      post = Future("http://www.sports.ru/stat/export/wapsports/blog_post.json?id={id}",id=blog_id)
      posts = Future("http://www.sports.ru/stat/export/wapsports/blog_posts.json?blog_name={blog_name}&count=10",blog_name=name)
      blog_post_comments = Future("http://www.sports.ru/stat/export/wapsports/blog_post_comments.json?id={id}&count=10",id=blog_id)
      category_blog_popular_posts = Future("http://www.sports.ru/stat/export/wapsports/category_blog_popular_posts.json?category_id={category_id}&count=10",category_id = post['category_id'])
      materials = Future("http://www.sports.ru/stat/export/wapsports/materials.json?category_id={category_id}&count=5",category_id=post['category_id'])
      return locals()
    
    before = time.time()
    context = construct()
    print 'context',context['post']
    print 'Futures collection:',time.time() - before
    template = jinja_template("cur_blog",context)
    return template
  

    

if __name__ == "__main__":
    #http_server = WSGIServer(('',5000),app)
    #http_server.serve_forever()
    app.jinja_env.add_extension('pyjade.ext.jinja.PyJadeExtension')
    app.debug = True
    app.run()
