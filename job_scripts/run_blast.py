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

def blast_targets(query, dbs):

#link to external environment for makeblastdb
    blast_cmd = "blastn"		#may make sense to make this modular
    db_path   = "/home/analysis/ctc/dev_p_bacster/2nd_try/p_bacster/blast_references/"
#output    = "blastresults.tab"
#cmd       = blast_cmd + " -db " + database + " -query " + query + " -out " + output + " -outfmt '7 std qlen slen'" 
    #cmd       = blast_cmd + " -db /home/analysis/ctc/dev_p_bacster/2nd_try/p_bacster/blast_references/" + dbs + "_DbS_BAC_assemblies_v1.fa -query <( echo -e \"" + query + "\" ) -outfmt '7 std qlen slen'" 
    cmd       = blast_cmd + " -db /home/analysis/ctc/dev_p_bacster/2nd_try/p_bacster/blast_references/" + dbs + "_DbS_BAC_assemblies_v1.fa -query <( echo -e \"" + query + "\" ) -outfmt '7 std qlen slen'" 

    json_results = []
    seen = {}
    count = 0
    #sys.stdout.write(str(cmd))

    check = re.compile('^#|^\s*$|^{}$')

    #c = subprocess.call(shlex.split(cmd), shell=False, stdout=subprocess.PIPE)
    #result = subprocess.Popen(shlex.split(cmd), shell=True, stdout=subprocess.PIPE, executable='/bin/bash')
    result = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, executable='/bin/bash')
    while True:
  
        record = result.stdout.readline()
        if not record:
	    break
        if check.match(record):
	    continue
        
        if count < 10:
            count = blast_parser(record, json_results, count, seen)
            record = record.rstrip('\n')
        else:
            result.terminate()
            break
    #sys.stdout.flush()
    
    #sys.stdout.write(str(json.dumps(json_results)))
    return json.dumps(json_results)

if __name__ == "__main__":
    blast_targets(">ZmChr0v2-08\\nTGTTGGGGACTTGTTCTTAAATGCTATGAGTTAAGAACAAGGCAACACAGAAAATGTTAAACATTAAGATCCTTCGTCCTTCGAAGCATTGTTTCCCTTA\\nGGATATAACGATCCCCGGACGAAGGTCATGAAGGATTAACCTTCATCACTATAATACACATTAGTAAAAGACGAAGCATATGAAACATAAAAGATAGCGT\\nGAATAATCGTATAACATTATTTATTTAACTTTATTAACTCATCATAAAGGAATAGAAACAATATTGAATTATAAATGTACCTTCGGCTTGGAGGGAAATG\\nAAAATACAAGTGTGACGCAAAAACAAATGCCAAGTCCGCGTGAACAGTACGGGGGTACTGTTCACCTATTTATAGGCACGGGGTACAACCCATACAAAAT\\nTACATACATGCCCTTTACATTTGGTGATAATTCTATAGCATTCTATCGAGGTCTAAATGGCCTTTTCATCTTTAAGTCGGTTCCCCTTTCTGCCAACATG\\nCCGAAGCTTTCCTGCTTCACAGCTTCGGCACTGTGTCAACCTTCGTATCTTTTGAGCTTCTCCCTTTCTGATTCAAGTCCGAAGATACCTGTTCACACAT\\nTATACTCCAGAAACATTGTTAAATCATGTTTTTGAGGACCTTCGGAAGCCGAAGGCCCCCAACAGTAGCCCCTCGCAATATTAATTTGTTTGAAATAATA\\nAATTCAGATTGCGATATGAACGAAGGCTTTATGCCGAAGGTCCGAAAAAACACCTTCCCTTTGCTAGAATAGCAACATTCAATGACAAGTGGGGTCTTTC\\nAACTTTCAACGCATCAAGCGTATAAATACGGCCATACCGCGAACTTATTTTGCACGCTTTCTGGCCAACCACTCCTGCTCACTCATTTTTTAGCTCTTGT\\nGCACTGTGATCTGCTAAGTTTTTAGCTTTGAAGCTTCGGCTTTTAGAAACAGTTTTTTAGCGCTTCCGAAGATGTCTGAAGCTGCTAAGAAGGCTGCTGC\\nTGAGATGAAGCTGAGTCTTGATGAAGAGAAGAACCTAGGGTTTCTTATAGCGATGTCGAAGTCCAACACAGAAAAGATTACCAAGGAAATTCTGGAGGGG\\nCTGTCTGAAGATACTGGTGACAGTGAAAGTTATGATATGGACAGCGGTGGCGAAGACTCCGAAGATCGCCCCTGGCGACCAAGCCATTCAGTTTATGGTA\\nAGTCAACTATCAAAGAGAATCATCTTGTTAATATGAGAGGAAGGTATTTCCGGGATCTGTCTATTGTGAGGGCGGACGAAGGGGAAAAAACTTGTCCACA\\nCCCTGAAGAAAATGAAGTTGTGGTGTACCGAAGCTTTTTGAAAGCTGGATTGCGATTCCCCTTGAGCAGCTTCGTCGTGGAGGTGTTGAAAATCTTCGAA\\nGTCTATCTTCATCAACTTACTCCCGAGGCAATTATAAGGCTAAATATCTTCGTGTGGGCCGCGAAGAGTCAAGGTCTGAAGCCTGACGCAAGAAGCTTTT\\nGTAATGTTCATGAACTATTATATGAAACAAAGCCTTGGGGCAAAGAACAGTACCATAACAACTTTGGCTGCTACAGCTTCGTTTCTCGGTCCGGGGCAAG\\nCTGTCCCGTACCAACCTTTCGGAAGAGATGGCCCGGGGATTGGATGACAGAATGGTTTTATGTGAAGAATGACTTATCAGCACGAGAAGACATCAAAGGT\\nATAATTATGCGTCCTATTTGGCAAAGCTTCGGCCTTCGGAGGCCGAAGGTTGAAATGAACGAAGCCGCCGAAGAGTGCCAAAGAGCCTTCAGCGTTGTCT\\nGCTCTTTTATAGGAACAAGGGACTTAGTACAAGAACATATCGCCTTCAGGGTGTGGCCGCTTGCTGAGAAATGGGAAATGCCACAAGAAACCATAAAAGA\\nGGCCGACGAAGGTGAGCTTGTGAGACTGAAGTACACGTTCAAATTTGGAGATAAATTTATTGAGCCAGATGATGAGTGGTTGAAAAGCATTGACAATTTA\\nAGTGATGAGCTACTCGGGACCTACTCGAAGGCTGAAGATAATGCAATGTCAGCAGCCTTCGGAGGCCGAAAAAAGAAGAGACTGAATCGGGTATTTGATG\\nCCATTGGGTTTGTCTACCCTGATTACTGCTATCCCATTCGAAGGCAGAAGAGAAAAAACACAAACTCTGCAAAAGAAGAAGCTGCAGCTGCTCCTAGCGA\\n", "HC69")
