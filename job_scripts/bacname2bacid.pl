#!/usr/bin/env perl

###############################################################################################################
#  1) Generate a .txt file(s) mapping feature ids to bac ids to be parsed by this script, e.g.:               #
#                                                                                                             #
#  zcat /home/analysis/ctc/dev_p_bacster/JBrowse_Pioneer/HC69_DbS_BAC_assemblies_v2.fa.gz | awk  -F"_" '{if(/^>/){gsub(">","");print $1"\t"$2}}' | uniq  >/home/analysis/ctc/dev_p_bacster/JBrowse_Pioneer/HC69_DbS_BAC_assemblies_BAC_BACID.txt                                                  # 
#                                                                                                             #
#                                                                                                             #
#  2) Run this script only after bacster_bacitem table has been populated with data via bacitems_populate.pl  #
#                                                                                                             #
###############################################################################################################

use strict;
use warnings;
use Getopt::Long; # get the command line options
use Pod::Usage; # so the user knows what's going on
use DBI; # our DataBase Interface
use Switch;

 # get the command line options and environment variables
my ($dbname, $username, $password, $host, $port, $files, $dir, $verbose);

GetOptions("dbname=s"           => \$dbname,
           "username=s"         => \$username,
           "password=s"         => \$password,
           "host=s"             => \$host,
           "port=i"             => \$port,
           "file=s"             => \$files,
           "dir=s"              => \$dir,
	   "v=s",               => \$verbose,
	   );

$dbname   = $dbname   || 'bacster';
$username = $username || 'bacster_dbo';
$password = $password || 'h0^odprE';
$host     = $host     || 'barclay';
$port     = $port     || '';
$dir      = $dir      || '/home/analysis/ctc/dev_p_bacster/JBrowse_Pioneer/';
$files    = $files    || 'HC69_DbS_BAC_assemblies_BAC_BACID.txt'; 
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

my $count = 0 ;

foreach my $file (split(/,\s*/, $files)) {
    open (MYFILE, $dir.$file); 
    print $file . "\n";
    while (<MYFILE>) { 
        my ($feature_id, $bacid) = split(/\t/, $_);
        chomp($feature_id);
        chomp($bacid);
        my $sql = "update bacster_bacitem set bacid = '$bacid' where feature_id = '$feature_id'";
        my $sth = $dbh->prepare($sql) or die "Cannot prepare: " . $dbh->errstr();
        $sth->execute() or die "Cannot execute: " . $sth->errstr();
        $sth->finish();       
        $count++;

        if($verbose) {
            print $sql;
        }

    } # while (<MYFILE>) 

    close (MYFILE);

} # foreach my $file

print "$count records updated in the bacster.bacster_bacitem\n";

# exit the script
exit;

