#!/usr/bin/env perl

########################################################################################################################################################################################################################
#                                                                                                                                                                                                                      #
# Location of gff3 files: /home/analysis/ctc/dev_p_bacster/JBrowse_Pioneer                                                                                                                                             #
# Preliminary step - run this command for each gff3 to generate a tab delimited txt file to be parsed by this script:                                                                                                  #
# grep mRNA <( cat /home/analysis/ctc/dev_p_bacster/JBrowse_Pioneer/HC69.BACs.PHIv2.gff3 ) | awk '{print $1"\t"$2"\t"$3"\t"$4"\t"$5"\t"$6"\t"$7"\t"$9}' > ~/pioneer0212/p_bacster/job_scripts/HC69.bacitems.txt        #
#                                                                                                                                                                                                                      #
########################################################################################################################################################################################################################

use strict;
use warnings;
use Getopt::Long; # get the command line options
use Pod::Usage; # so the user knows what's going on
use DBI; # our DataBase Interface
use DBD::mysql;
use Switch;

 # get the command line options and environment variables
my ($dbname, $username, $password, $host, $port, $files, $verbose);

GetOptions("dbname=s"           => \$dbname,
           "username=s"         => \$username,
           "password=s"         => \$password,
           "host=s"             => \$host,
           "port=i"             => \$port,
           "file=s"             => \$files,
	   "v=s",         => \$verbose,
	   );

$dbname   = $dbname   || 'bacster';
$username = $username || 'bacster_dbo';
$password = $password || 'h0^odprE';
$host     = $host     || 'barclay';
$port     = $port     || '';
$files    = $files    || 'HC69.bacitems.txt, HG11.bacitems.txt'; #, EDH5G.bacitems.txt, GR2HT.bacitems.txt
$verbose  = $verbose  || 0;

#--- start sub-routine ------------------------------------------------
sub ConnectToMySql {

    my ($db) = @_;
    my $connectionInfo="dbi:mysql:$db;$host";
    my $l_connection = DBI->connect($connectionInfo,$username,$password);
    return $l_connection;
}
#--- end sub-routine --------------------------------------------------

print "Connecting to database $dbname\n";
my $dbh = ConnectToMySql($dbname);

# delete all existing records in bacster_bacitem:
my $query = "DELETE FROM bacster_bacitem";
my $sth = $dbh->prepare($query) or die "Cannot prepare: " . $dbh->errstr();
$sth->execute() or die "Cannot execute: " . $sth->errstr();
$sth->finish();

my $count = 0 ;

# map confidence codes to confidence values for each data set:
my %conf = ( "HC69"  => { "#87CEEB" => "low", "#000080" => "high" },
             "HG11"  => { "#90EE90" => "low", "#006400" => "high" },
             "GR2HT" => { "#DDA0DD" => "low", "#800080" => "high" },
	     "EDH5G" => { "#FFA07A" => "low", "#8B0000" => "high" },
	   );

foreach my $file (split(/,\s*/, $files)) {
    open (MYFILE, $file); 
    print $file;
    while (<MYFILE>) { 
        my ($seqid, $source, $feature_type, $start, $end, $score, $strand, $attr) = split(/\t/, $_);
        my ($feature_id, $bacset_id, $confidence);

        if ($attr =~ /Parent=([^;]+);/) {
            $feature_id = $1;
        } else {
	    next;
        }        
        
        if ($feature_id =~ /^([^\.]+)\./) {
            my $bacitem_set = $1;    
            $sth = $dbh->prepare("select id from bacster_bacset where label like ?");
            $sth->bind_param( 1, "$bacitem_set%");
            $sth->execute() or die "Cannot execute: " . $sth->errstr();
	    $bacset_id = $sth->fetchrow_array();
            $sth->finish();

            if ($attr =~ /color=([^;]+);/) {
	      $confidence = $conf{$bacitem_set}{$1} || "fail";             
	    } else {
	      $confidence = "fail";	
	    }

        } else {
	    next;
        }

        my $sql = "INSERT INTO bacster_bacitem (seqid, source, feature_type, start, end, score, strand, feature_id, bacset_id, confidence) 
                   VALUES ('$seqid', '$source', '$feature_type', '$start', '$end', '$score', '$strand', '$feature_id', '$bacset_id', '$confidence')";
        $sth = $dbh->prepare($sql) or die "Cannot prepare: " . $dbh->errstr();
        $sth->execute() or die "Cannot execute: " . $sth->errstr();
        $sth->finish();       
        $count++;

        if($verbose) {
            print $sql;
        }

    } # while (<MYFILE>) 

    close (MYFILE);

} # foreach my $file

print "$count records entered in the bacster.bacster_bacitem\n";

# exit the script
exit;

