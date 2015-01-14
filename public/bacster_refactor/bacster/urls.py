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
    url(r'^crud/bacset$', bacsetCRUDView.as_view(), name='bacset_view'),
    url(r'^crud/targettype$', targettypeCRUDView.as_view(), name='targettype_view'),
    url(r'^crud/target$', targetCRUDView.as_view(), name='target_view'),
    url(r'^crud/bac$', bacCRUDView.as_view(), name='bac_view'),                       
    url(r'^crud/bacsession$', bacsessionCRUDView.as_view(), name='bacsession_view'),
    #url(r'^crud/targettype/(?P<label>\w+)$', targettypeCRUDView.as_view(), name='targettype_view_param'),                      
    url(r'^crud/sessioninfo/(?P<pk>\d+)$', sessionCRUDView.as_view(), name='session_view_param'),
    url(r'^crud/sessioninfo_pid/(?P<pioneer_id>\d+)$', views.multiobject, name='pid_session_view_param'),                
    url(r'^crud/blast_targets$', views.blast, name='blast_test'),
)
