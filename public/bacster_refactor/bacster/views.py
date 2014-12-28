from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import Template, Context
import json

def index(request, template_name):
    return render_to_response(template_name)
    #print template_name
    #return render_to_response('bacster/index.html')
# Create your views here.
