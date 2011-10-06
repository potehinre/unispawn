import jinja2,cjson,httplib2
import gevent_aggregator

from flask import Flask,url_for,render_template,abort
app = Flask(__name__)
app.config.from_object(__name__)

@app.route("/favicon.ico")
def favicon():
	abort(404)

@app.route("/<name>")
def index(name):
    urls = eval(open('conf/'+name).read())
    content = gevent_aggregator.collect(urls)
    context = cjson.decode(content)
    return render_template(name+".html",**context)
    

if __name__ == "__main__":
    app.run(debug=True)
