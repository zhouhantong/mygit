#!/bin/sh

MARK_DIR=mark
TARGET_DIR=src
BUILD_DIR=build

BASE=(Gruntfile.js node_modules package.json)
BASE_SRC=(css images js lib 404.html app.js blank.html favicon.ico index.html index.js main.js setting.js test.html test.js)
GROUP=()

if [ ! $1 ]; then
	grunt build:proc
	exit 0
elif [[ $(ls $TARGET_DIR) =~ $1 ]]; then
	echo "第一参数为src目录存在文件"
	GROUP=($@)
else
	case $1 in
		hfz) GROUP=(consumer2 market);;
		act) GROUP=(activity);;
		*) GROUP=($@);;
	esac
fi

rm -rf $BUILD_DIR
rm -rf $MARK_DIR
mkdir $MARK_DIR
mkdir $MARK_DIR/$TARGET_DIR

for x in ${BASE[@]}
do
	echo "copy: "$x
	cp -R $x $MARK_DIR/
done

for x in ${BASE_SRC[@]}
do
	echo "copy: "$x
	cp -R $TARGET_DIR/$x $MARK_DIR/$TARGET_DIR/
done

for x in ${GROUP[@]}
do
	echo "copy: "$x
	cp -R $TARGET_DIR/$x $MARK_DIR/$TARGET_DIR/
done

echo "开始编译 ==============================================="
cd ${MARK_DIR}/
ls -al
grunt build:proc
cp -R $BUILD_DIR ../$BUILD_DIR
cd ..
rm -rf $MARK_DIR
echo "编译结束 ==============================================="