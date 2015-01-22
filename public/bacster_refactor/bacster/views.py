from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import Template, Context
import json
from django.core.context_processors import csrf
import os, sys
from djangular.views.crud import NgCRUDView
import MySQLdb
from django.db import connection
from django.db import models
from bacster.models import Session
from django.forms.models import modelform_factory
from django.views.generic import FormView
from django.views.decorators.csrf import ensure_csrf_cookie

from run_blast import blast_targets

@ensure_csrf_cookie

def index(request, template_name):
    c = {}
    c.update(csrf(request))
    return render_to_response(template_name, c)
    #print template_name
    #return render_to_response('bacster/index.html')
# Create your views here.

def multiobject(request, pioneer_id):
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM bacster_session WHERE pioneer_id=%s", [pioneer_id])
    desc = cursor.description
    all = [
	    dict(zip([col[0] for col in desc], row))
            for row in cursor.fetchall()
          ]
    return HttpResponse(json.dumps(all), content_type="application/json")


def session_targets_old(request, session_id, organism_id, genome_id, bacset_id):
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM bacster_organism, bacster_genome, bacster_bacset, bacster_targettype, bacster_target, bacster_bac, bacster_bacsession where bacster_bacsession.bac_id= bacster_bac.id and bacster_bac.bacset_id = bacster_bacset.id and bacster_bac.target_id = bacster_target.id and bacster_target.targettype_id = bacster_targettype.id and bacster_bacset.genome_id = bacster_genome.id and bacster_genome.organism_id = bacster_organism.id and bacster_bacsession.session_id =%s and bacster_organism.id=%s and bacster_genome.id=%s and bacster_bacset.id=%s  ", [session_id, organism_id, genome_id, bacset_id])
    desc = cursor.description
    all = [
            dict(zip([col[0] for col in desc], row))
            for row in cursor.fetchall()
          ]
    return HttpResponse(json.dumps(all), content_type="application/json")


def session_targets(request, session_id):
        cursor = connection.cursor()
        cursor.execute("SELECT *, bacster_bacsession.id bacsession_id FROM bacster_organism, bacster_genome, bacster_bacset, bacster_targettype, bacster_target, bacster_bac, bacster_bacsession where bacster_bacsession.bac_id= bacster_bac.id and bacster_bac.bacset_id = bacster_bacset.id and bacster_bac.target_id = bacster_target.id and bacster_target.targettype_id = bacster_targettype.id and bacster_bacset.genome_id = bacster_genome.id and bacster_genome.organism_id = bacster_organism.id and bacster_bacsession.session_id =%s", [session_id])
        desc = cursor.description
        all = [
                dict(zip([col[0] for col in desc], row))
                for row in cursor.fetchall()
              ]
        return HttpResponse(json.dumps(all), content_type="application/json")

def bacsessions(request, session_id):
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM bacster_bacsession, bacster_bac WHERE bacster_bacsession.bac_id= bacster_bac.id and bacster_bacsession.session_id =%s", [session_id])
        desc = cursor.description
        all = [
                dict(zip([col[0] for col in desc], row))
                for row in cursor.fetchall()
              ]
        return HttpResponse(json.dumps(all), content_type="application/json")      

def bacitem(request, feature_id):
        cursor = connection.cursor()
        cursor.execute("SELECT id, feature_id, feature_type, seqid, start, end, CAST(score as CHAR) score, bacset_id FROM bacster_bacitem where feature_id =%s", [feature_id])
        desc = cursor.description
        all = [
                dict(zip([col[0] for col in desc], row))
                for row in cursor.fetchall()
              ]
        return HttpResponse(json.dumps(all), content_type="application/json")


def blast(request, bacsession_id):
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM bacster_bacsession, bacster_bac, bacster_target, bacster_bacset WHERE bacster_bacsession.bac_id= bacster_bac.id and bacster_bac.bacset_id = bacster_bacset.id and bacster_bac.target_id = bacster_target.id and bacster_bacsession.id =%s", [bacsession_id])
            desc = cursor.description
            all = [
                    dict(zip([col[0] for col in desc], row))
                    for row in cursor.fetchall()
                  ]
            return HttpResponse(blast_targets(all[0]['seq'], all[0]['label'].split('.')[0].replace("\"", "")), content_type="application/json")


def tabix_interval(request, chr, start, end, bacset):

            return
