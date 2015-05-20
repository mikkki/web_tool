from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import Template, Context
import json
from django.core.context_processors import csrf
import os, sys, re
from djangular.views.crud import NgCRUDView
import MySQLdb
from django.db import connection
from django.db import models
from bacster.models import Session
from django.forms.models import modelform_factory
from django.views.generic import FormView
from django.views.decorators.csrf import ensure_csrf_cookie

from run_blast import blast_targets
from run_tabix import *


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
    cursor.execute("SELECT * FROM bacster_organism, bacster_genome, bacster_bacset, bacster_targettype, bacster_target, bacster_bac, bacster_bacsession where bacster_bacsession.bac_id= bacster_bac.id and bacster_bac.bacset_id = bacster_bacset.id and bacster_bac.target_id = bacster_target.id and bacster_target.targettype_id = bacster_targettype.id and bacster_bacset.organism_id = bacster_organism.id and bacster_genome.organism_id = bacster_organism.id and bacster_bacsession.session_id =%s and bacster_organism.id=%s and bacster_genome.id=%s and bacster_bacset.id=%s  ", [session_id, organism_id, genome_id, bacset_id])
    desc = cursor.description
    all = [
            dict(zip([col[0] for col in desc], row))
            for row in cursor.fetchall()
          ]
    return HttpResponse(json.dumps(all), content_type="application/json")


def session_targets(request, session_id):
        cursor = connection.cursor()
        cursor.execute("SELECT *, bacster_bacsession.id bacsession_id \
                        FROM bacster_bacsession, \
                             bacster_bac,        \
                             bacster_organism,   \
                             bacster_bacset,     \
                             bacster_targettype, \
                             bacster_target      \
                        WHERE bacster_bacsession.bac_id = bacster_bac.id and           \
                              bacster_bac.bacset_id = bacster_bacset.id and            \
                              bacster_bac.target_id = bacster_target.id and            \
                              bacster_target.targettype_id = bacster_targettype.id and \
                              bacster_bacset.organism_id = bacster_organism.id and     \
                              bacster_bacsession.session_id =%s", [session_id])
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
        cursor.execute("SELECT id, feature_id, feature_type, seqid, start, end, CAST(score as CHAR) score, bacset_id, confidence, bacid FROM bacster_bacitem where confidence != 'fail' and feature_id =%s", [feature_id])
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
            blast_result = blast_targets(all[0]['seq'], all[0]['label'].split('.')[0].replace("\"", ""))

            if blast_result == '[]': #no hits
                return HttpResponse(json.dumps(all), content_type="application/json")
            else:
                return HttpResponse(blast_result, content_type="application/json")


def tabix_interval(request, bacsession_id):
            cursor = connection.cursor()
            cursor.execute("SELECT *, bacster_organism.label organism, bacster_bacset.label as gff_ref FROM bacster_bacsession, bacster_bac, bacster_target, bacster_bacset, bacster_organism WHERE bacster_bacsession.bac_id= bacster_bac.id and bacster_bac.bacset_id = bacster_bacset.id and bacster_bac.target_id = bacster_target.id and bacster_bacset.organism_id = bacster_organism.id and  bacster_bacsession.id =%s", [bacsession_id])
            desc = cursor.description
            all = [
                    dict(zip([col[0] for col in desc], row))
                    for row in cursor.fetchall()
                  ]
            #coords, organism, gff_ref - "ZmChr0v2:10000-100000", "zea_mays", "HC69"
            regex    = re.compile(r'\(([a-zA-Z ]+)\)')
            organism = regex.search(all[0]['organism']).group(1).lower().replace(" ", "_")
            return HttpResponse(run_tabix(all[0]['coords'], organism, all[0]['gff_ref'].split('.')[0].replace("\"", "")), content_type="application/json")


def format_jbrowse(request, bacsession_id, region):
            cursor = connection.cursor()
            genome = region.split(':')[0] 
            cursor.execute("SELECT *, bacster_organism.label reference, bacster_bacset.label as gff_ref, bacster_bacsession.session_id as session_id, bacster_session.pioneer_id as pioneer_id, bacster_targettype.label as targettype\
                            FROM  bacster_bacsession,\
                                  bacster_bac,       \
                                  bacster_target,    \
                                  bacster_bacset,    \
                                  bacster_organism,  \
                                  bacster_session,   \
                                  bacster_genome,    \
                                  bacster_targettype \
                            WHERE bacster_bacsession.bac_id = bacster_bac.id and           \
                                  bacster_bac.bacset_id = bacster_bacset.id and            \
                                  bacster_bac.target_id = bacster_target.id and            \
                                  bacster_bacset.organism_id = bacster_organism.id and     \
                                  bacster_bacsession.session_id = bacster_session.id and   \
                                  bacster_target.targettype_id = bacster_targettype.id and \
                                  bacster_genome.organism_id = bacster_organism.id and     \
                                  bacster_bacsession.id =%s and                            \
                                  bacster_genome.label =%s", [bacsession_id, genome])
            desc = cursor.description
            all = [
                    dict(zip([col[0] for col in desc], row))
                    for row in cursor.fetchall()
                  ]
                  #region, gff_ref, id, organism
            sys.stderr.write("input region : " + str(all[0]['reference']))
            id         = str(all[0]['pioneer_id']) + '-' + str(all[0]['session_id'])
            len        = all[0]['len']
            # assuming that the reference has the following format 'Zea Mays B73', extracting the organism name:             
            organism   = '_'.join(all[0]['reference'].split(' ')[0:2]).lower()
            start      = int(region.split(':')[1].split('-')[0]) - 100000
            start      = start if int(start) > 0 else 1
            end        = int(region.split(':')[1].split('-')[1]) + 100000
            end        = len if int(end) > int(len) else end
            ext_region = genome + ":" + str(start) + "-" + str(end)            
            #var = region_to_jbrowse2(region, all[0]['gff_ref'].split('.')[0].replace("\"", ""), id, organism)

            
            if (all[0]['targettype'] == 'coordinates'):
                return HttpResponse(json.dumps({"url": region_to_jbrowse2(region, all[0]['gff_ref'].split('.')[0].replace("\"", ""), id, organism)}), content_type="application/json")
            else: 
                #return HttpResponseRedirect("http://" + region_to_jbrowse2(ext_region, all[0]['gff_ref'].split('.')[0].replace("\"", ""), id, organism))
                return HttpResponse(json.dumps({"url":   region_to_jbrowse2(ext_region, all[0]['gff_ref'].split('.')[0].replace("\"", ""), id, organism)}), content_type="application/json")
      

def collect_tracks(request, session_id, organism):
        cursor = connection.cursor()
        cursor.execute("SELECT *, bacster_organism.label organism, bacster_bacset.label as gff_ref, bacster_bacsession.session_id as session_id, bacster_session.pioneer_id as pioneer_id FROM bacster_bacsession, bacster_bac, bacster_target, bacster_bacset, bacster_organism, bacster_session WHERE bacster_bacsession.bac_id= bacster_bac.id and bacster_bac.bacset_id = bacster_bacset.id and bacster_bac.target_id = bacster_target.id and bacster_bacset.organism_id = bacster_organism.id and bacster_bacsession.session_id = bacster_session.id and bacster_bacsession.id =%s", [bacsession_id])
        desc = cursor.description
        all = [
                 dict(zip([col[0] for col in desc], row))
                 for row in cursor.fetchall()
              ]
        id       = str(all[0]['pioneer_id']) + '-' + str(all[0]['session_id'])
        regex    = re.compile(r'\(([a-zA-Z ]+)\)')
        organism = regex.search(all[0]['organism']).group(1).lower().replace(" ", "_")
       
        return HttpResponseRedirect("http://" + collect_results(id, organism))
