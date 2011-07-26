-module(unispawn).
-export([start/1,stop/0,req_async/1,start_download/0]).
-define(DOWNLOAD_TIMEOUT,20000).
%Сервер забирающий json с бекэндов и отдающий его пользователю

parse_result(Result) ->
    case Result of
	[{Name,{_,_,Body}}|_] ->
	    ["\"",Name,"\":",Body];
	[{Name,{error,Reason}}|_] ->
	    io:format("Worker ~p phailed with reason ~p ~n",[Name,Reason])
    end.

start(Port) ->
    inets:start(),
    misultin:start_link([{port,Port},{loop,fun(Req) -> handle_http(Req) end}]).

stop() ->
    misultin:stop(),
    inets:stop().

handle_http(Req) ->
    handle(Req:get(method),Req:resource([lowercase,urlencode]),Req).

handle('GET',[],Req) ->
    Results=start_download(),
    Req:ok(Results);

handle('GET',["favicon.ico"],Req) ->
    Path=["favicon.ico"],
    Req:respond(404,[{"Content-Type","text/html"}],["File favicon /",Path,"not found"]).

start_download() ->
    Urls=[{"news","http://www.sports.ru/stat/export/wapsports/news.json?category_id=238&count=1"},
          {"comments","http://www.sports.ru/stat/export/wapsports/news_comments.json?id=112146357&count=1"},
	  {"blogs","http://www.sports.ru/stat/export/wapsports/blogs.json?category_id=23"},
          {"conferences","http://www.sports.ru/stat/export/wapsports/conferences.json?category_id=23"}],
    {ok,Dict} = download(Urls),
    Results=collect(Dict),
    Parsed=[parse_result(Result) || Result<-Results],
    "{"++(string:join(Parsed,","))++"}".


%Cтартует асинхронных запрашивателей для заданных урлов
%%Получает список вида [{Name,Url}...] и возвращает словарь вида dict(Ref:{Name,Result})
download(Urls) ->
    download_aux(Urls,dict:new()).

%%Ожидает запрашивателей и возвращает результат
%%Получает словать вида dict(Ref:{Name,Result})
collect(Dict) ->
    collect_aux(Dict,[]).
	   
req_async(Url) ->
  httpc:request(get,{Url,[]},[],[{sync,false}]).

download_aux(Urls,Dict) ->
    case Urls of
	[{Name,Url}|T] ->
	    {ok,RequestId} = req_async(Url),
	    io:format("Requesting url ~p for name ~p with id ~p ~n",[Url,Name,RequestId]),
	    NewDict=dict:append(RequestId,{Name,Url},Dict),
	    download_aux(T,NewDict);
	[]-> {ok,Dict}
    end.

collect_aux(Dict,ResultList) ->
    Size=dict:size(Dict),
    if Size>0 ->
	    receive
		{http,{RequestId,Body}}->
		    [{Name,Url}]=dict:fetch(RequestId,Dict),
		    io:format("i received content from ~p ~n",[{Name,Url}]),
		    NewDict=dict:erase(RequestId,Dict),
		    collect_aux(NewDict,[[{Name,Body}]|ResultList])
	    after ?DOWNLOAD_TIMEOUT ->
		    io:format("Its fucking timeout")
	    end;
       Size=<0 -> ResultList
    end.
