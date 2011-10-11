import gevent
from gevent import monkey
import random
import httplib2
import time
monkey.patch_all()

def get_content(urlname,url):
    try:
        htt = httplib2.Http(timeout=3000)
        response,content = htt.request(url)
        return (urlname,content)
    except Exception,ex:
        return (urlname,('error',ex.message))

def to_json(result):
    if type(result[1]) is tuple:
        return """"%s":{"error":"%s"}"""%(result[0],result[1][1])
    else:
        return """"%s":{"data":%s}"""%(result[0],result[1])

def collect(urls):
    jobs = [gevent.spawn(get_content,urlname,url) for urlname,url in urls.items()]
    gevent.joinall(jobs,timeout=3000)
    result ='{'+','.join([to_json(job.value) for job in jobs])+'}'
    return result
