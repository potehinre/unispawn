# -*- coding: utf-8 -*-
import gevent
from gevent import monkey
import random
import httplib2
import time
monkey.patch_all()
import re
import ujson

def get_content(urlname,url):
    try:
        before = time.time()
        htt = httplib2.Http(timeout=3000)
        response,content = htt.request(url)
        print "Request ",urlname," is ",time.time() - before
        return (urlname,content)
    except Exception,ex:
        return (urlname,('error',ex.message))

def to_json(result):
    if type(result[1]) is tuple:
        return """ {"%s":{"error":"%s"}} """%(result[0],result[1][1])
    else:
        return """ {"%s":{"data":%s}} """%(result[0],result[1])

def sync_collect(urls):
    jobs = [get_content(urlname,url) for urlname,url in urls.items()]
    result ='{'+','.join([to_json(job) for job in jobs])+'}'
    return result

def collect(urls):
    jobs = [gevent.spawn(get_content,urlname,url) for urlname,url in urls.items()]
    gevent.joinall(jobs,timeout=3000)
    result ='{'+','.join([to_json(job.value) for job in jobs])+'}'
    return result

class DependencyAggregator(object):
    regex = re.compile("\{\{\s*(.+?)\s*\}\}")
    def __init__(self,urls):
        #dag - ациклический граф
        self.dag = {}
        #парсим исходный урл , получаем ациклический граф зависимостей
        #одного урла от другого
        for name,url in urls.items():
            self.dag[name] = {}
            self.dag[name]['url'] = url
            self.dag[name]['deps'] = {}
            self.dag[name]['result'] = None
            
            matches = re.findall(self.regex, url)
            for match in matches:
                dep, var = match.split('.')
                try:
                    self.dag[name]['deps'][dep].append(var)
                except KeyError:
                    self.dag[name]['deps'][dep] = [var]
            deps = self.dag[name]['deps']
            self.dag[name]['greenlet'] = gevent.Greenlet(self._get_content,name,url,deps)
            
    def _store_result(self,urlname,result):
        json = to_json(result)
        res = ujson.decode(json)
        self.dag[urlname]['result'] = res
    
    def _get_content(self,urlname,url,deps):
        #Если есть зависимости , сначала ждем их
        generated_url=url
        try:
            if deps:
                dep_greenlets = [self.dag[name]['greenlet'] for name in self.dag[urlname]['deps'].keys()]
                gevent.joinall(dep_greenlets)
                print 'joined deps',deps,urlname
                
                #Затем проверяем во всех ли зависимостях есть данные
                for dep_name,variables in deps.items():
                    result = self.dag[dep_name]['result']
                    root = result.keys()[0]
                    if (result is None) or (not result[root].has_key('data')):
                        raise ValueError,"Dependency failed"
                    for variable in variables:
                        value = str(result[root]['data'][variable])
                        to_replace = "\{\{\s*%s.%s\s*\}\}"%(dep_name, variable)
                        generated_url = re.sub(to_replace, value, generated_url)
            #Запрашиваем сгенеренный урл
            htt = httplib2.Http(timeout=3000)
            response,content = htt.request(generated_url)
            result = (urlname,content)
            print 'requested:',generated_url
            self._store_result(urlname,result)
        except Exception,ex:
            result = (urlname, ('error', ex.message))
            self._store_result(urlname,result)
            
    def collect(self):
        #Запускаем гринлеты
        greenlets = [self.dag[name]['greenlet'] for name in self.dag.keys()]
        for greenlet in greenlets:
            greenlet.start()
            
        #Ждем пока все завершится
        gevent.joinall(greenlets)
        
        #Выгребаем результаты из словаря
        results = {}
        for name, parameters in self.dag.items():
            results.update(parameters['result'])
        return results
    