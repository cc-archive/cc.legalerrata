#!/bin/bash

# Stupid checkout tool
# 
# Written in 2011 by Christopher Allan Webber, Creative Commons
# 
# To the extent possible under law, the author(s) have dedicated all
# copyright and related and neighboring rights to this software to the
# public domain worldwide. This software is distributed without any
# warranty.
# 
# You should have received a copy of the CC0 Public Domain Dedication along
# with this software. If not, see
# <http://creativecommons.org/publicdomain/zero/1.0/>.

BASEDIR="cc/legalerrata/checkouts"

if [ ! -d $BASEDIR ]; then
    mkdir $BASEDIR -p
fi
    
cd $BASEDIR
BASEDIR=`pwd`

function make_or_update_checkout_git
{
    DIRNAME=$1
    URL=$2

    cd $BASEDIR

    if [ ! -d $DIRNAME ]; then
        echo "-- Cloning into $DIRNAME --"
        git clone $URL $DIRNAME
    else
        echo "-- Updating $DIRNAME --"
        cd $DIRNAME
        git pull
    fi
}

function make_or_update_checkout_svn
{
    DIRNAME=$1
    URL=$2

    cd $BASEDIR

    if [ ! -d $DIRNAME ]; then
        echo "-- Cloning into $DIRNAME --"
        svn co $URL $DIRNAME
    else
        echo "-- Updating $DIRNAME --"
        cd $DIRNAME
        svn up
    fi
}


make_or_update_checkout_svn legalcode \
    http://code.creativecommons.org/svnroot/legalcode/branches/production
make_or_update_checkout_svn includes \
    http://code.creativecommons.org/svnroot/ccwordpress/trunk/www/includes
