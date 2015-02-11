#!/usr/bin/env python

#					#
#	Script for Tabix Indexing	#
#	p_bacster NCGR			#
#					#

import shlex
import os
import sys
import subprocess
import re
import json

from gff_to_json import gff_parser
#link to external environment for tabix

def run_tabix(coords, organism, gff_ref):
	db_path = str("/home/analysis/ctc/dev_p_bacster/2nd_try/p_bacster/tabix_gffs/" + organism)
	
	cmd   = "tabix " + db_path + "/" + gff_ref + "*.gz " + coords
	result = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, executable='/bin/bash')

        json_results = []
	feature = re.compile('\tgene\t')

	while True:
		record = result.stdout.readline()
		if not record:
			break
		if not feature.search(record):
			continue
		
		record = record.rstrip('\n')
		gff_parser(record, json_results)
#	print json.dumps(json_results) + "\n"
	return json.dumps(json_results)


def region_to_jbrowse(region, gff_ref, id, organism):

	db_path     = str("/home/analysis/ctc/dev_p_bacster/2nd_try/p_bacster/tabix_gffs/" + organism)
        track_label = gff_ref + "_" + region.replace(":", "_")
        check_path  = str(os.environ['JBROWSE_HOME'] + "/" + id + "/" + organism + "/" + track_label)

        if os.path.isdir(check_path):
		sys.stderr.write("instance:" + track_label + " exists\n")
		#sys.exit(0)
        else:
		cmd   = "flatfile-to-json.pl --gff <( " + "tabix " + db_path + "/" + gff_ref + "*.gz " + region + " ) --trackType CanvasFeatures --out " + '$JBROWSE_HOME/' + id + "/" + organism + "/" + track_label + " --trackLabel " + track_label
	#sys.stdout.write(str(cmd))
		shell = subprocess.Popen(cmd, shell=True, executable='/bin/bash')


def collect_results(id, organism):
	check_path = str(os.environ['JBROWSE_HOME'] + "/" + id + "/" + organism)
	main       = os.environ['JBROWSE_HOME']
	tracks     = os.listdir(check_path)

	if not (os.path.isdir(check_path) and len(tracks) > 0):
		sys.stderr.write("something is awry, please check" + check_path)
		sys.exit(0)

        if not os.path.isdir(check_path + "/main"):
		cmd   = "cp -r " + main + "/main_template/ " + check_path + "/main;ln -s " + main + "/refs/" + organism + "/seq " + check_path + "/main"

		shell = subprocess.Popen(cmd, shell=True, executable='/bin/bash')
	
	for track in tracks:
		if (os.path.isdir(check_path + "/main/tracks/" + track) or track == 'main'):
			continue

		cmd   = "head -14 " + check_path + "/" + track + "/trackList.json | tail -12 | add-track-json.pl " + check_path + "/main/trackList.json;cp -r " + check_path + "/" + track + "/tracks/* " + check_path + "/main/tracks"

		shell = subprocess.Popen(cmd, shell=True, executable='/bin/bash')

#if __name__ == "__main__":
	#run_tabix("ZmChr0v2:10000-100000", "zea_mays", "HC69")
	#region_to_jbrowse("ZmChr0v2:50000-150000", "HC69", "12345-99", "zea_mays") #pioneer-id session_id
	#collect_results("12345-99", "zea_mays") #pioneer-id session_id
