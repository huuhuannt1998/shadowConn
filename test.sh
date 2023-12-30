#!/bin/bash

# Define your variables

channel_name="shadow-driver"
channel_description="Shadow Driver"
channel_terms_url="http://uncc.edu"

foldername=$1

newfolder="$foldername"-shadow

rm -rf "$newfolder" 

mkdir "$newfolder"

cp -r "$foldername"/* "$newfolder"

./smartthings.exe edge:drivers:package "$newfolder"

./smartthings.exe edge:channels:create





