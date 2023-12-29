#!/bin/bash

foldername=$1

newfolder="$foldername"-shadow

rm -rf "$newfolder" 

mkdir "$newfolder"

cp -r "$foldername"/* "$newfolder"

./smartthings.exe edge:drivers:package "$newfolder"

expect << EOF
spawn ./smartthings.exe edge:channels:create

expect "? Channel name:"  
send "shadow-drivers\n"

expect "? Channel description:" 
send "Shadow drivers\n"

expect "? Channel terms of service URL:"
send "uncc.edu\n"  

expect eof
EOF


