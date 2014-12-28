from django.conf.urls import patterns, url

urlpatterns = patterns('bacster.views',
    # the index
    url(r'^$', 'index', {'template_name' : 'bacster/index.html'}, name='index'),
    
)
