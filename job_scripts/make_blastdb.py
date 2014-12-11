#!/usr/bin/env python

#					#
#	Script for blastdb creation	#
#	p_bacster NCGR			#
#					#

import shlex
import sys
import subprocess

#link to external environment for makeblastdb

db_type = "nucl"
subject = "reference.fasta"	#assumes reference has been retrieved locally
cmd     = "makeblastdb -dbtype " + db_type + " -in " + subject

print cmd

subprocess.call(shlex.split(cmd), shell=False)
