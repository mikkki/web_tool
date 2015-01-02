from django.conf.urls import patterns, url
from djangular.views.crud import NgCRUDView
from bacster import views 
from bacster.models import sessionCRUDView


urlpatterns = patterns('bacster.views',
    # the index
    url(r'^$', 'index', {'template_name' : 'bacster/index.html'}, name='index'),
    url(r'^crud/sessioninfo/(\d*)?$', sessionCRUDView.as_view(), name='my_crud_view'),                      
)
