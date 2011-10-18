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
        return """"%s":{"error":"%s"}"""%(result[0],result[1][1])
    else:
        return """"%s":{"data":%s}"""%(result[0],result[1])

def sync_collect(urls):
    jobs = [get_content(urlname,url) for urlname,url in urls.items()]
    result ='{'+','.join([to_json(job) for job in jobs])+'}'
    return result

def collect(urls):
    jobs = [gevent.spawn(get_content,urlname,url) for urlname,url in urls.items()]
    gevent.joinall(jobs,timeout=3000)
    result ='{'+','.join([to_json(job.value) for job in jobs])+'}'
    return result

urls = {'posts':'http://for.ru/post','news':'http://for.ru/news/$post.id/$post.name'}


class DepAggregator(object):
    regex = re.compile("\$[a-z\._]+")
    def __init__(self,urls):
        #dag - ациклический граф
        self.dag = {}
        #парсим исходный урл , получаем ациклический граф зависимостей
        #одного урла от другого
        for name,url in urls.items():
            self.dag[name] = {}
            self.dag[name]['url'] = url
            self.dag[name]['deps'] = {}
            
            matches = re.findall(self.regex, url)
            for match in matches:
                splitted = match.split('.')
                var = splitted[1]
                dep = splitted[0][1:]
                try:
                    self.dag[name]['deps'][dep].append(var)
                except KeyError:
                    self.dag[name]['deps'][dep] = [var]
            deps = self.dag[name]['deps']
            self.dag[name]['greenlet'] = gevent.Greenlet(self._get_content,name,url,deps)

    
    def _get_content(self,name,url,deps):
        #Если есть зависимости , сначала ждем их
        if deps:
            dep_greenlets = [self.dag[name]['greenlet'] for name in self.dag[name][deps]]
            print name,' is joining '
            gevent.joinall(dep_greenlets)
        try:
            before = time.time()
            htt = httplib2.Http(timeout=3000)
            response,content = htt.request(url)
            print "Request ",urlname," is ",time.time() - before
            return (urlname,content)
        except Exception,ex:
            return (urlname,('error',ex.message))
            
    def collect():
        greenlets = [self.dag[name]['greenlet'] for name in self.dag.keys()]
        gevent.joinall(greenlets)
        values = [greenlet.value for greenlet in greeenlets]
        return values
        
    
    def get_dag(self):
        return self.dag

if __name__ == '__main__':
    aggr = DepAggregator(urls)
    print aggr.get_dag()