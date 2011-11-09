import unittest
import sys
sys.path.append("../")
import gevent_aggregator

def collect_urls(urls):
    aggr = gevent_aggregator.DependencyAggregator(urls)
    return aggr.collect()


class ErrorHandlingTest(unittest.TestCase):
    def test_timeout(self):
        result = collect_urls({"timeout":"http://localhost:100/timeout"})
        self.assertEqual(result['timeout'],{u'error': u"timeout"})
        
    def test_nonexisting_page(self):
        result = collect_urls({"nexist":"http://www.sports.ololo/"})
        self.assertEqual(result['nexist'],{u'error': u'Unable to find the server at www.sports.ololo'})
        
    def test_incorrect_json(self):
        result = collect_urls({"test":"http://localhost:100/incorrect_json"})
        self.assertEqual(result['test'],{u"error":"Expected object or value"})
        
    def test_dependency_failed(self):
        result = collect_urls({"post":"http://www.sports.ololo/stat/export/wapsports/blog_post.json?id=255756",
                               "category_blog_popular_posts":"http://www.sports.ru/stat/export/wapsports/category_blog_popular_posts.json?category_id={{post.category_id}}&count=10"})
        self.assertEqual(result["category_blog_popular_posts"], {u'error': u'Dependency failed'})
        

if __name__ == '__main__':
    unittest.main()
    
