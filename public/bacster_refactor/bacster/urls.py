from django.conf.urls import patterns, url
from djangular.views.crud import NgCRUDView
from bacster import views 
from bacster.models import * #sessionCRUDView


urlpatterns = patterns('bacster.views',
    # the index
    url(r'^$', 'index', {'template_name' : 'bacster/index.html'}, name='index'),
    #url(r'^crud/sessioninfo/(\d*)?$', sessionCRUDView.as_view(), name='my_crud_view'),
    url(r'^crud/sessioninfo$', sessionCRUDView.as_view(), name='my_sessioninfo_view'),
    url(r'^crud/organism$', organismCRUDView.as_view(), name='my_organism_view'),
    url(r'^crud/sessioninfo/(?P<pk>\d+)$', sessionCRUDView.as_view(), name='my_crud_view_param'),
    #url(r'^crud/sessioninfo/pioneer$', views.multiobject, name='pid_my_crud_view_param'),
    url(r'^crud/sessioninfo_pid/(?P<pioneer_id>\d+)$', views.multiobject, name='pid_my_crud_view_param'),
)
