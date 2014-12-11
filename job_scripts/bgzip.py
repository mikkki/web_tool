#!/usr/bin/env python

#					#
#	Script for blastdb creation	#
#	p_bacster NCGR			#
#					#

import shlex
import sys
import subprocess

#link to external environment for tabix

gff3file = "test.gff3"		#assumes reference has been retrieved locally
cmd      = "bgzip " + gff3file

print cmd

subprocess.call(shlex.split(cmd), shell=False)
