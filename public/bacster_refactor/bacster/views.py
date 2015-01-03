from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import Template, Context
import json
from django.core.context_processors import csrf

from djangular.views.crud import NgCRUDView
import MySQLdb
from django.db import models
from bacster.models import Session

def index(request, template_name):
    c = {}
    c.update(csrf(request))
    return render_to_response(template_name, c)
    #print template_name
    #return render_to_response('bacster/index.html')
# Create your views here.
            

