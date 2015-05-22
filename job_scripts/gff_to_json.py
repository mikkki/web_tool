#!/usr/bin/env python

import os, sys
import json
import re

def gff_parser(row, bacs):
        feature  = re.compile('ID=(.+);')
	elements = row.split("\t")

	seqid      = elements[0]
	start      = elements[3]
	stop       = elements[4]
	score      = elements[5]
	attributes = elements[8]

	region = seqid + ":" + str(start) + "-" + str(stop)
	bacid  = feature.search(attributes).group(1)

	bacs.append({"SeqID":seqid, "Score":score, "BacID":bacid, 
		     "Region":region})

