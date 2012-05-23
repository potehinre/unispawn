var http = require('http'),
    url = require('url'),
	jade = require('jade'),
	fs = require('fs');

var aggregator = {adress:"127.0.0.1",port:"5000"};
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
			if (res.statusCode == 200)
			{
				response = JSON.parse(data);
				var path = response.template;
				var context = response.context;
				template = fs.readFileSync(path,'utf8');
				fn = jade.compile(template,{filename:path,pretty:true});
			}
			resp.writeHead(res.statusCode,{'Content-Type':'text/html'});
  			resp.end(fn(context));
		});
	});
	req.on('error',function(error)
	{
		console.log(error + ' Problems, officer?');
	});
	req.end();
}).listen(1337,'127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
