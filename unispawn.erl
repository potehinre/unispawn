-module(unispawn).
-export([start/1,stop/0,req_async/1,start_download/0]).
-define(DOWNLOAD_TIMEOUT,20000).
%Сервер забирающий json с бекэндов и отдающий его пользователю

parse_result(Result) ->
    case Result of
	{Name,{ok,Body}} ->
	    ["\"",Name,"\":{\"data\":",Body,"}"];
	{Name,{error,Reason}} ->
	    io:format("Worker ~p phailed with reason ~p ~n",[Name,Reason]),
	    ["\"",Name,"\":{\"error\":\"",atom_to_list(Reason),"\"}"]
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
    Urls=[{"main_news","http://www.sports.ru/stat/export/wapsports/mainnews.json?count=7"},
          {"football_news","http://www.sports.ru/stat/export/wapsports/news.json?category_id=208&count=5"},
          {"hockey_news","http://www.sports.ru/stat/export/wapsports/news.json?category_id=209&count=5"},
          {"basket_news","http://www.sports.ru/stat/export/wapsports/news.json?category_id=210&count=5"},
          {"automoto_news","http://www.sports.ru/stat/export/wapsports/news.json?category_id=227&count=5"},
          {"boxing_news","http://www.sports.ru/stat/export/wapsports/news.json?category_id=213&count=5"},
          {"tennis_news","http://www.sports.ru/stat/export/wapsports/news.json?category_id=212&count=5"},
          {"biathlon_news","http://www.sports.ru/stat/export/wapsports/news.json?category_id=225&count=5"},
          {"other_news","http://www.sports.ru/stat/export/wapsports/news.json?category_id=256&count=5"},
          {"style_news","http://www.sports.ru/stat/export/wapsports/news.json?category_id=111163733&count=5"},
          {"blogs","http://www.sports.ru/stat/export/wapsports/blogs.json?count=13"},
          {"conferences","http://www.sports.ru/stat/export/wapsports/conferences.json?count=5"},
          {"materials","http://www.sports.ru/stat/export/wapsports/materials.json?count=4"}],
    {ok,Dict,DownloadErrors} = download(Urls),
    Results=collect(Dict)++DownloadErrors,
    Parsed=[parse_result(Result) || Result<-Results],
    io:format("Results are ~p",[Parsed]),
    "{"++(string:join(Parsed,","))++"}".


%Cтартует асинхронных запрашивателей для заданных урлов
%%Получает список вида [{Name,Url}...] и возвращает словарь вида dict(Ref:{Name,Result})
download(Urls) ->
    download_aux(Urls,dict:new(),[]).

%%Ожидает запрашивателей и возвращает результат
%%Получает словать вида dict(Ref:{Name,Result})
collect(Dict) ->
    collect_aux(Dict,[]).
	   
req_async(Url) ->
  httpc:request(get,{Url,[]},[],[{sync,false}]).

download_aux(Urls,Dict,Errors) ->
    case Urls of
	[{Name,Url}|T] ->
	    case req_async(Url) of
		{ok,RequestId} -> 
		    io:format("Requesting url ~p for name ~p with id ~p ~n",[Url,Name,RequestId]),
		    NewDict=dict:append(RequestId,{Name,Url},Dict),
		    download_aux(T,NewDict,Errors);
		{error,Reason} -> 
		    io:format("Error occured while requesing ~p for name ~p",[Url,Name]),
		    NewErrors=[{Name,{error,Reason}}|Errors],
		    download_aux(T,Dict,NewErrors)
	    end;
	[]-> {ok,Dict,Errors}
    end.

collect_aux(Dict,ResultList) ->
    Size=dict:size(Dict),
    if Size>0 ->
	    receive
		{http,{RequestId,ReqResult}}->
		    [{Name,Url}]=dict:fetch(RequestId,Dict),
		    NewDict=dict:erase(RequestId,Dict),
		    Result=case ReqResult of
			       {error,Reason} ->{error,Reason};
			       {_,_,Body} -> 
				   {ok,Body}
			   end,
		    collect_aux(NewDict,[{Name,Result}|ResultList])
	    after ?DOWNLOAD_TIMEOUT ->
		    io:format("Its fucking timeout")
	    end;
       Size=<0 -> ResultList
    end.
