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
import time

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


def region_to_jbrowse2(region, gff_ref, id, organism):
	url         = os.environ['JBROWSE_URL']
	db_path     = str("/home/analysis/ctc/dev_p_bacster/2nd_try/p_bacster/tabix_gffs/" + organism)
        track_label = gff_ref + "_" + region.replace(":", "_")
        check_path  = str(os.environ['JBROWSE_HOME'] + "/" + id + "/" + organism + "/" + track_label)
	main_path   = str(os.environ['JBROWSE_HOME'] + "/" + id + "/" + organism)
	main        = os.environ['JBROWSE_HOME']

        if os.path.isdir(check_path):
		sys.stderr.write("instance:" + track_label + " exists\n")
		return str(url + id + "/" + organism + "/main/")

	cmd   = "flatfile-to-json.pl --gff <( " + "tabix " + db_path + "/" + gff_ref + "*.gz " + region + " ) --trackType CanvasFeatures --out " + '$JBROWSE_HOME/' + id + "/" + organism + "/" + track_label + " --trackLabel " + track_label
	#sys.stdout.write(str(cmd))
	shell = subprocess.Popen(cmd, shell=True, executable='/bin/bash')

	stream = shell.communicate()[0]
        code = shell.returncode

        if code != 0:
        	sys.stderr.write("Track Formatting Failed: " + shell.returncode + "\n")
                return False

	if not os.path.isdir(main_path + "/main"):
                cmd   = "mkdir -p " + main_path + "/main;cp -r " + main + "/main_template/* " + main_path + "/main;ln -s " + main + "/refs/" + organism + "/seq " + main_path + "/main"

                shell = subprocess.Popen(cmd, shell=True, executable='/bin/bash')
		stream = shell.communicate()[0]
	        code = shell.returncode

        #sys.stderr.write("odd\n" + shell.returncode + "\n")
	        if code != 0:
        		sys.stderr.write("Main Creation Failed: " + shell.returncode + "\n")
        	        return False

	if os.path.isdir(main_path + "/main/tracks/" + track_label):
        	sys.stderr.write("Main Instance: " + main_path + "/main/tracks/" + track_label + " exists\n")
		return str(url + id + "/" + organism + "/main/")

	cmd   = "head -14 " + main_path + "/" + track_label + "/trackList.json | tail -12 | add-track-json.pl " + main_path + "/main/trackList.json;cp -r " + main_path + "/" + track_label + "/tracks/* " + main_path + "/main/tracks"

#	sys.stderr.write(cmd + "\n")


	shell = subprocess.Popen(cmd, shell=True, executable='/bin/bash')
	stream = shell.communicate()[0]
        code = shell.returncode

        #sys.stderr.write("odd\n" + shell.returncode + "\n")
        if code != 0:
		sys.stderr.write("Main Track Formatting and Addition Failed: " + str(shell.returncode) + "\n")
                return False

	sys.stdout.write(str(url + id + "/" + organism + "/main/\n"))

	return str(url + id + "/" + organism + "/main/")


def collect_results(id, organism):
	check_path = os.path.normpath(str(os.environ['JBROWSE_HOME'] + "/" + id + "/" + organism))
	main       = os.environ['JBROWSE_HOME']
	url        = os.environ['JBROWSE_URL']
	tracks     = os.listdir(check_path)

	if not (os.path.isdir(check_path) and len(tracks) > 0):
		sys.stderr.write("something is awry, please check" + check_path)
		return False

        if not os.path.isdir(check_path + "/main"):
		cmd   = "mkdir -p " + + check_path + "/main;cp -r " + main + "/main_template/ " + check_path + "/main;ln -s " + main + "/refs/" + organism + "/seq " + check_path + "/main"

		shell = subprocess.Popen(cmd, shell=True, executable='/bin/bash')
		stream = shell.communicate()[0]
                code = shell.returncode

                if code != 0:
                        return False
	
	for track in tracks:
		if (os.path.isdir(check_path + "/main/tracks/" + track) or track == 'main'):
			continue

		cmd   = "head -14 " + check_path + "/" + track + "/trackList.json | tail -12 | add-track-json.pl " + check_path + "/main/trackList.json;cp -r " + check_path + "/" + track + "/tracks/* " + check_path + "/main/tracks"

		shell = subprocess.Popen(cmd, shell=True, executable='/bin/bash')
		stream = shell.communicate()[0]
		code = shell.returncode

		if code != 0:
			return False 

	return str(url) + str(id) + "/" + str(organism) + "/main/"


def region_to_jbrowse(region, gff_ref, id, organism):

        db_path     = str("/home/analysis/ctc/dev_p_bacster/2nd_try/p_bacster/tabix_gffs/" + organism)
        track_label = gff_ref + "_" + region.replace(":", "_")
        check_path  = str(os.environ['JBROWSE_HOME'] + "/" + id + "/" + organism + "/" + track_label)

        if os.path.isdir(check_path):
                sys.stderr.write("instance:" + track_label + " exists\n")
		return False

        cmd   = "flatfile-to-json.pl --gff <( " + "tabix " + db_path + "/" + gff_ref + "*.gz " + region + " ) --trackType CanvasFeatures --out " + '$JBROWSE_HOME/' + id + "/" + organism + "/" + track_label + " --trackLabel " + track_label
        #sys.stdout.write(str(cmd))
        shell = subprocess.Popen(cmd, shell=True, executable='/bin/bash')
	stream = shell.communicate()[0]
	code = shell.returncode

	#sys.stderr.write("odd\n" + shell.returncode + "\n")
	if code != 0:
		return False

	url = collect_results(id, organism)

	if url:
		sys.stderr.write("this is my url: " + url + "\n")
		return url
	
	return str("this is broken")


if __name__ == "__main__":
	#run_tabix("ZmChr0v2:10000-100000", "zea_mays", "HC69")
	#region_to_jbrowse("ZmChr0v2:10000-170000", "HC69", "12345-99", "zea_mays") #pioneer-id session_id
	region_to_jbrowse2("ZmChr0v2:10000-170000", "HC69", "12345-99", "zea_mays") #pioneer-id session_id
	#collect_results("12345-99", "zea_mays") #pioneer-id session_id
