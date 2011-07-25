-module(unispawn).
-export([start/0,req_async/1]).
%Сервер забирающий json с бекэндов и отдающий его пользователю

parse_result(Result) ->
    case Result of
	[{Name,{_,_,Body}}|_T] ->
	    io:format("Worker ~p received body ~n",[Name]);
	[{Name,{error,Reason}}|_T] ->
	    io:format("Worker ~p phailed with reason ~p ~n",[Name,Reason])
    end.

start() ->
    inets:start(),
    Urls=[{"news","http://www.sports.ru/stat/export/wapsports/news.json?category_id=238"},
          {"comments","http://www.sports.ru/stat/export/wapsports/news_comments.json?id=112146357"}],
    {ok,Dict} = download(Urls),
    Results=collect(Dict),
    [parse_result(Result) || Result<-Results],
    io:format("Completed ~n"),
    inets:stop().

%Cтартует асинхронных запрашивателей для заданных урлов
%%Получает список вида [{Name,Url}...] и возвращает словарь вида dict(Ref:{Name,Result})
download(Urls) ->
    download_aux(Urls,dict:new()).

%%Ожидает запрашивателей и возвращает результат
%%Получает словать вида dict(Ref:{Name,Result})
collect(Dict) ->
    collect_aux(Dict,[]).
	   
req_async(Url) ->
  http:request(get,{Url,[]},[],[{sync,false}]).

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
		{http,{RequestId,_Body}}->
		    [{Name,Url}]=dict:fetch(RequestId,Dict),
		    io:format("i received content from ~p ~n",[{Name,Url}]),
		    NewDict=dict:erase(RequestId,Dict),
		    collect_aux(NewDict,[[{Name,_Body}]|ResultList])
	    after 20000 ->
		    io:format("Its fucking timeout")
	    end;
       Size=<0 -> ResultList
    end.
