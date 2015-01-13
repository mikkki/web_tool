#!/usr/bin/env python

#					#
#	Script for initiating blastn 	#
#	p_bacster NCGR			#
#					#

import shlex
import sys
import subprocess
import re
import json
from blast_to_json import blast_parser, json_from_blast

def blast_targets():

#link to external environment for makeblastdb
    database  = "/home/ctc/test_Stuff/search-example.fa"	#assumes reference has been retrieved locally
    blast_cmd = "blastn"		#may make sense to make this modular
    query     = "/home/ctc/test_Stuff/search-example.fa"
#output    = "blastresults.tab"
#cmd       = blast_cmd + " -db " + database + " -query " + query + " -out " + output + " -outfmt '7 std qlen slen'" 
    cmd       = blast_cmd + " -db " + database + " -query " + query + " -outfmt '7 std qlen slen'" 
    json_results = {}
    check = re.compile('^#|^\s*$|^{}$')

    #c = subprocess.call(shlex.split(cmd), shell=False, stdout=subprocess.PIPE)
    result = subprocess.Popen(shlex.split(cmd), shell=False, stdout=subprocess.PIPE)
    while True:
  
        record = result.stdout.readline()
        if not record:
	    break
        if check.match(record):
	    continue
        
        record = record.rstrip('\n')
        blast_parser(record, json_results)
#    sys.stdout.write(str(json.dumps(json_results)))
#    sys.stdout.flush()
    return json.dumps(json_results)

if __name__ == "__main__":
    blast_targets()
