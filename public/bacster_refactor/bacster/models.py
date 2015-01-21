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

class BacItem(models.Model):
	#The first element in each tuple is the actual value to be set on the model,
	#and the second element is the human-readable name.
	STRAND = (('+', '+'),('-','-'))

	bacset     = models.ForeignKey(BacSet)
	feature_id = models.CharField(max_length=150)                          # Col9: attributes->ID
	seqid      = models.CharField(max_length=150)                          # Col1
	source     = models.CharField(max_length=150)                          # Col2
        feature_type = models.CharField(max_length=150)                        # Col3
	start      = models.CharField(max_length=50)                           # Col4
	end        = models.CharField(max_length=50)                           # Col5
	score      = models.DecimalField(max_digits=16, decimal_places=6)      # Col6
	strand     = models.CharField(max_length=1,                            # Col7
				      choices=STRAND)

class sessionCRUDView(NgCRUDView):
	model = Session
	slug_field = 'pioneer_id' #not unique!! cannot be used as slug_field
	
class organismCRUDView(NgCRUDView):
        model = Organism
	slug_field = 'label'

class genomeCRUDView(NgCRUDView):
        model = Genome
        slug_field = 'label'

class bacsetCRUDView(NgCRUDView):
	model = BacSet
	slug_field = 'label'

class targettypeCRUDView(NgCRUDView): 
        model = TargetType
        slug_field = 'label' 

class targetCRUDView(NgCRUDView):
	model = Target

class bacCRUDView(NgCRUDView):
	model = Bac

class bacsessionCRUDView(NgCRUDView):
	model = BacSession


# Create your models here.
