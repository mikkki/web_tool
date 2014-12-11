#!/usr/bin/env python

#					#
#	Script for blastdb creation	#
#	p_bacster NCGR			#
#					#

import shlex
import sys
import subprocess

#link to external environment for makeblastdb

database  = "reference.fasta"	#assumes reference has been retrieved locally
blast_cmd = "blastn"		#may make sense to make this modular
query     = "seqs.fasta"
output    = "blastresults.tab"
cmd       = blast_cmd + " -db " + database + " -query " + query + " -out " + output + " -outfmt '7 std qlen slen'" 

print cmd

subprocess.call(shlex.split(cmd), shell=False)
