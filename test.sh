#!/bin/bash

# Define your variables
set timeout -1
channel_name="shadow-driver"
channel_description="Shadow Driver"
channel_terms_url="http://uncc.edu"

foldername=$1

newfolder="$foldername"-shadow

rm -rf "$newfolder" 

mkdir "$newfolder"

cp -r "$foldername"/* "$newfolder"

# Start the command
spawn ./smartthings.exe edge:channels:create

# Expect the channel name prompt and send the channel name
expect "? Channel name:"
send "$channel_name\r"

# Expect the channel description prompt and send the description
expect "? Channel description:"
send "$channel_description\r"

# Expect the terms of service URL prompt and send the URL
expect "? Channel terms of service URL:"
send "$channel_terms_url\r"

# Wait for the command to complete
expect eof




