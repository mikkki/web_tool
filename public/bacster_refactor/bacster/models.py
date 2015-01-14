from django.shortcuts import render
import MySQLdb
from django.db import models
from djangular.views.crud import NgCRUDView
#from django.views.decorators.csrf import ensure_csrf_cookie

#@ensure_csrf_cookie

class Session(models.Model):
        pioneer_id = models.CharField(max_length=50)
        notes = models.CharField(max_length=150)

class Organism(models.Model):
	label    = models.CharField(max_length=150)

class Genome(models.Model):
	label    = models.CharField(max_length=150)
        organism = models.ForeignKey(Organism)

class BacSet(models.Model):
	label  = models.CharField(max_length=150)
	genome = models.ForeignKey(Genome)

class TargetType(models.Model):
	label = models.CharField(max_length=50)
	
class Target(models.Model):
	seq    = models.TextField()
	coords = models.CharField(max_length=50)
	targettype = models.ForeignKey(TargetType)

class Bac(models.Model):
	bacset = models.ForeignKey(BacSet)
	target = models.ForeignKey(Target)

class BacSession(models.Model):
        bac = models.ForeignKey(Bac)
        session = models.ForeignKey(Session)

class sessionCRUDView(NgCRUDView):
	model = Session
	slug_field = 'pioneer_id'
	
class organismCRUDView(NgCRUDView):
        model = Organism
	slug_field = 'label'

class genomeCRUDView(NgCRUDView):
        model = Genome
        slug_field = 'label'

class bacsetCRUDView(NgCRUDView):
	model = BacSet
	slug_field = 'label'
# Create your models here.
