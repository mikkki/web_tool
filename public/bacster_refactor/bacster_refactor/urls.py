from django.conf.urls import patterns, include, url
from django.contrib import admin
from bacster.models import * #sessionCRUDView

urlpatterns = patterns('',
    # Examples:
    #url(r'^bacster/', include('bacster.urls')),    

    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', include('bacster.urls')),
    url(r'^crud/sessioninfo\.json$', sessionCRUDView.as_view(), name='my_crud_view'),
    url(r'^crud/sessioninfo/(?P<pk>\d+)\.json$', mysessionCRUDView.as_view(), name='my_crud_view_param'),
)
