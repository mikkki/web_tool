#!/usr/bin/env perl

use strict;
use warnings;
use Getopt::Long; # get the command line options
use Pod::Usage; # so the user knows what's going on
use DBI; # our DataBase Interface
use Mysql;

# Preliminary step - run this command:
# grep gene <( zcat /home/analysis/ctc/dev_p_bacster/2nd_try/p_bacster/tabix_gffs/HC69.BACs.ZmPHIv2.fixed.gff3.gz ) | awk '{print $1"\t"$2"\t"$3"\t"$4"\t"$5"\t"$6"\t"$7"\t"$NF}' >  HC69.bacitems.txt

 # get the command line options and environment variables
my ($dbname, $username, $password, $host, $port, $file);


GetOptions("dbname=s"           => \$dbname,
           "username=s"         => \$username,
           "password=s"         => \$password,
           "host=s"             => \$host,
           "port=i"             => \$port,
           "file=s"             => \$file,
	   );

$dbname   = $dbname   || 'bacster';
$username = $username || 'bacster_dbo';
$password = $password || 'h0^odprE';
$host     = $host     || 'barclay';
$port     = $port     || '';
$file     = $file     || 'HC69.bacitems.txt';

#--- start sub-routine ------------------------------------------------
sub ConnectToMySql {

    my ($db) = @_;

# assign the values to your connection variable
    my $connectionInfo="dbi:mysql:$db;$host";

# make connection to database
    my $l_connection = DBI->connect($connectionInfo,$username,$password);

# the value of this connection is returned by the sub-routine
    return $l_connection;

}
#--- end sub-routine --------------------------------------------------

print "Connecting to database $dbname\n";

# invoke the ConnectToMySQL sub-routine to make the database connection
my $connection = ConnectToMySql($dbname);

# set the value of your SQL query
my $query = "SELECT VERSION()";

# prepare your statement for connecting to the database
my $statement = $connection->prepare($query);

# execute your SQL statement
$statement->execute();

# retrieve the values returned from executing your SQL statement
my @data = $statement->fetchrow_array();

# print the first (and only) value from the @data array
# we add a \n for a new line (carriage return)
print "$data[0] \n";


open (MYFILE, $file); 
while (<MYFILE>) { 
  chomp; print "$_\n"; 
} 
close (MYFILE);

# exit the script
exit;

