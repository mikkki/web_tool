#!/usr/bin/env python

#					#
#	Script for Tabix Indexing	#
#	p_bacster NCGR			#
#					#

import shlex
import sys
import subprocess

#link to external environment for tabix

gff3filebgz = "test.gff3.gz"		#assumes reference has been retrieved locally
cmd         = "tabix " + gff3filebgz + " -p gff"

print cmd

subprocess.call(shlex.split(cmd), shell=False)
