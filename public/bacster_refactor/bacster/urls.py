from django.conf.urls import patterns, url
from djangular.views.crud import NgCRUDView
from bacster import views 
from bacster.models import * #sessionCRUDView

# resource names are in accordance with the REST naming convention:
# http://www.restapitutorial.com/lessons/restquicktips.html
urlpatterns = patterns('bacster.views',
    # the index
    url(r'^$', 'index', {'template_name' : 'bacster/index.html'}, name='index'),
    url(r'^crud/sessions$', sessionCRUDView.as_view(), name='sessions_view'),
    url(r'^crud/organisms$', organismCRUDView.as_view(), name='organism_view'),
    url(r'^crud/genomes$', genomeCRUDView.as_view(), name='genome_view'),
    url(r'^crud/bacsets$', bacsetCRUDView.as_view(), name='bacset_view'),
    url(r'^crud/target_types$', targettypeCRUDView.as_view(), name='targettype_view'),
    url(r'^crud/targets$', targetCRUDView.as_view(), name='target_view'),
    url(r'^crud/bacs$', bacCRUDView.as_view(), name='bac_view'),                       
    url(r'^crud/bacsessions$', bacsessionCRUDView.as_view(), name='bacsession_view'),
    url(r'^crud/bacsessions/(?P<session_id>\d+)$', views.bacsessions, name='bacsessions_view_param'),
    url(r'^crud/session_targets/(?P<session_id>\d+)$', views.session_targets, name='session_targets_view_param'),                       
    url(r'^crud/sessions/(?P<pk>\d+)$', sessionCRUDView.as_view(), name='session_view_param'),
    url(r'^crud/blast_targets/(?P<bacsession_id>\d+)$', views.blast, name='blast_test'),
    url(r'^crud/bacitems/(?P<feature_id>.+)$', views.bacitem, name='blast_test'),                       
    url(r'^crud/tabix_results/(?P<bacsession_id>\d+)$', views.tabix_interval, name='tabix_interval'),
    url(r'^crud/jbrowse_links/(?P<bacsession_id>\d+)/(?P<region>.+)$', views.format_jbrowse, name='format_jbrowse'),
    url(r'^crud/collect_tracks/(?P<bacsession_id>\d+)$', views.collect_tracks, name='collect_tracks'),
)
