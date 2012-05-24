var http = require('http'),
    url = require('url'),
	jade = require('jade'),
	fs = require('fs'),
    cluster = require('cluster');

var numCPUs = require('os').cpus().length;


var TemplateCache = function()
{
	this.cache = {}
}

TemplateCache.prototype.compileTemplate = function(path)
{
	var template = fs.readFileSync(path,'utf8');
	var fun = jade.compile(template,{filename:path,pretty:true});
	return fun;
}

TemplateCache.prototype.add = function(path)
{
	console.log("Adding template to cache" + path);
	var fun = this.compileTemplate(path);
	this.cache[path] = fun;
	return fun;
}

TemplateCache.prototype.getOrCreate = function(path)
{
	if (this.cache[path] != undefined)
	{
		return this.cache[path];
	}
	return this.add(path);
}

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
    console.log('worker started');
  }

  cluster.on('death', function(worker) {
    console.log('worker ' + worker.pid + ' died');
  });
}
else
{
    var aggregator = {adress:"127.0.0.1",port:"5000"};
    var templCache = new TemplateCache();
    http.createServer(function(req,resp) {
	    var options = {
		    host:aggregator.adress,
		    port:aggregator.port,
		    path:req.url,
		    method:req.method
	      };
	
	    //Проксируем запрос к питоновскому бекенду
	    var req = http.request(options,function(res)
	    {
		    var data = '';
		    res.setEncoding('utf8');
		    res.on('data',function(chunk) {
			    data+=chunk;
		    });
		    res.on('end',function()
		    {
			    var fn;
			    if (res.statusCode == 200)
			    {
                    try
                    {
				        response = JSON.parse(data);
				        var path = response.template;
				        var context = response.context;
				        fn = templCache.getOrCreate(path);
                    }
                    catch(e)
                    {
                        console.log(e);
                    }
                
			    }
			    resp.writeHead(res.statusCode,{'Content-Type':'text/html;charset=utf-8'});
			    if (fn != undefined)   
			    { 
			     resp.end(fn(context));
			    }
			    else    
			    { 				   
				    resp.end();
			    }
		    });
	    });
	    req.on('error',function(error)
	    {
		    console.log(error + ' Problems, officer?');
	    });
	    req.end();
    }).listen(1337,'127.0.0.1');
}
console.log('Server running at http://127.0.0.1:1337/');
