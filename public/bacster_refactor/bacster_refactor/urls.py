from django.conf.urls import patterns, include, url
from django.contrib import admin
from djangular.views.crud import NgCRUDView
from bacster import views
from bacster.models import sessionCRUDView

urlpatterns = patterns('',
    # Examples:
    #url(r'^bacster/', include('bacster.urls')),    
    #url(r'^$', 'index', {'template_name' : 'bacster/index.html'}, name='index'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', include('bacster.urls')),
    url(r'^crud/sessioninfo$', sessionCRUDView.as_view(), name='my_crud_view'),
    url(r'^crud/sessioninfo/(?P<pk>\d+)$', sessionCRUDView.as_view(), name='my_crud_view_param'),
)
