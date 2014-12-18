#!/usr/bin/env python

import os, sys
import json
import re
from optparse import OptionParser


def blast_parser(row, queries):
    elements = row.split("\t")

    query         = elements[0]
    subject       = elements[1]
    identity      = elements[2]
    aln_len       = elements[3]
    query_start   = elements[6]
    query_stop    = elements[7]
    subject_start = elements[8]

    if query in queries:
        if queries[query]['best_hit'] == subject:
            queries[query][subject]['hsps'].append([query_start, query_stop])
            queries[query][subject]['record'].append([elements])
	    
    else:
	
        queries[query]                    = {}
        queries[query]['best_hit']        = subject
        queries[query][subject]           = {}
        queries[query][subject]['hsps']   = [query_start, query_stop]
	queries[query][subject]['record'] = [elements]

    #print repr(query) + repr(queries[query]['best_hit']) + repr(queries[query][queries[query]['best_hit']]['hsps'])

def json_from_blast(input_file):

    check = re.compile('^#|^\s*$|^{}$')
    
    queries_json = {}

    with open(input_file) as blast:
    	for lines in blast:
            if check.match(lines):
                continue
	    
	    lines = lines.rstrip('\n')
            blast_parser(lines, queries_json)

    return json.dumps(queries_json)


if __name__ == "__main__":
    
    parser = OptionParser(usage="""

    usage: %prog [options] input.tab
    """)

    parser.add_option('-i', '--input', help="blast tabular input file")

    (options, args) = parser.parse_args()

    if not options.input:
        parser.print_help()
        exit(1)

    json_from_blast(options.input)

#import argparse

#parser = argparse.ArgumentParser()

#parser.add_parser("-in")

