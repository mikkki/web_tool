from django.conf.urls import patterns, url
from djangular.views.crud import NgCRUDView
from bacster import views 
from bacster.models import * #sessionCRUDView


urlpatterns = patterns('bacster.views',
    # the index
    url(r'^$', 'index', {'template_name' : 'bacster/index.html'}, name='index'),
    url(r'^crud/sessioninfo$', sessionCRUDView.as_view(), name='sessioninfo_view'),
    url(r'^crud/organism$', organismCRUDView.as_view(), name='organism_view'),
    url(r'^crud/genome$', genomeCRUDView.as_view(), name='genome_view'),
    url(r'^crud/sessioninfo/(?P<pk>\d+)$', sessionCRUDView.as_view(), name='session_view_param'),
    url(r'^crud/sessioninfo_pid/(?P<pioneer_id>\d+)$', views.multiobject, name='pid_session_view_param'),                
    url(r'^crud/blast_targets$', views.blast, name='blast_test'),
)
