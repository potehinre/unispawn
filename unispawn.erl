-module(unispawn).
-export([start/0,req_async/1]).
%Сервер забирающий json с бекэндов и отдающий его пользователю

parse_result(Result) ->
    case Result of
	[H|T]->
	    case H of
		[{Name,{_,_,Body}}|_T] ->
		     io:format("Worker ~p received body ~p ~n",[Name,Body]);
		[{Name,{error,Reason}}|_T] ->
		    io:format("Worker ~p phailed",[Name])
	    end,
	    parse_result(T);
	[] -> io:write("end")
    end.

start() ->
    inets:start(),
    Urls=[{"mail","http://www.mail.sru"},{"user","http://www.google.com"}],
    {ok,Dict} = download(Urls),
    Result=collect(Dict),
    parse_result(Result),
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
