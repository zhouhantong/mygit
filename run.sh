#!/bin/bash

PWD=$(pwd)

LOG_DIR=$PWD/server-logs
ALL_LOG=$LOG_DIR/all.log
OUT_LOG=$LOG_DIR/out.log
ERR_LOG=$LOG_DIR/err.log

forever=$PWD/node_modules/forever/bin/forever

if [ ! -d $LOG_DIR ]; then
  mkdir $LOG_DIR
fi

if [ $# != 1 ]
then
    for x in $@
    do
    	sh $PWD/run.sh $x
    done
    exit 0
fi

case "$1" in
	start|-s)
		$forever start -l $ALL_LOG -o $OUT_LOG -e $ERR_LOG -a server.js
	;;
	startlog|-sl)
	    sh $PWD/run.sh start
	    sh $PWD/run.sh log
	;;
	stop|end|-e)
		$forever stop server.js
	;;
	reload|restart|-r)
		$forever restart -l $ALL_LOG -o $OUT_LOG -e $ERR_LOG -a server.js
	;;
	clear|clean|-c)
        sh $PWD/run.sh stop
        rm -rf $LOG_DIR
    ;;
    log|-l)
    	tail -100f $ALL_LOG
    ;;
    err|error|-el)
        tail -100f $ERR_LOG
    ;;
    out|-ol)
        tail -100f $OUT_LOG
    ;;
	*)
	    sh $PWD/run.sh clear
		sh $PWD/run.sh start
		exit 1
	;;
esac

exit 0