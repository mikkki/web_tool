#!/usr/bin/env perl

use strict;
use warnings;
use Getopt::Long; # get the command line options
use Pod::Usage; # so the user knows what's going on
use DBI; # our DataBase Interface
use Mysql;

# Preliminary step - run these commands:
# grep gene <( zcat /home/analysis/ctc/dev_p_bacster/2nd_try/p_bacster/tabix_gffs/HC69.BACs.ZmPHIv2.fixed.gff3.gz ) | awk '{print $1"\t"$2"\t"$3"\t"$4"\t"$5"\t"$6"\t"$7"\t"$NF}' >  HC69.bacitems.txt
# grep gene <( zcat /home/analysis/ctc/dev_p_bacster/2nd_try/p_bacster/tabix_gffs/HG11.BACs.Regions.ZmPHIv2.fixed.gff3.gz ) | awk '{print $1"\t"$2"\t"$3"\t"$4"\t"$5"\t"$6"\t"$7"\t"$NF}' > HG11.bacitems.txt


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
$files    = $files    || 'HC69.bacitems.txt, HG11.bacitems.txt';
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
foreach my $file (split(/,\s*/, $files)){
    open (MYFILE, $file); 
    while (<MYFILE>) { 
        my ($seqid, $source, $feature_type, $start, $end, $score, $strand, $attr) = split(/\t/, $_);
        my ($feature_id, $bacset_id);

        if ($attr =~ /ID=([^;]+);/) {
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
        } else {
	    next;
        }

        my $sql = "INSERT INTO bacster_bacitem (seqid, source, feature_type, start, end, score, strand, feature_id, bacset_id) 
                   VALUES ('$seqid', '$source', '$feature_type', '$start', '$end', '$score', '$strand', '$feature_id', '$bacset_id')";
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

