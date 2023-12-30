#!/bin/bash

# Define your newfolder variable
newfolder="$1"

# Package the driver, display the output, and capture it
./smartthings.exe edge:drivers:package "$newfolder" | tee package_output.json

# Use jq to extract the Driver ID and Version from the JSON output
driver_id=$(jq -r '.driverId' package_output.json)
echo "Driver ID: $driver_id"

version=$(jq -r '.version' package_output.json)
echo "Driver Version: $version"

# Define channel characteristics
channel_name="shadow-driver"
channel_description="Shadow Driver"
channel_terms_url="http://uncc.edu"

# Create the channel and capture output
./smartthings.exe edge:channels:create

echo "Please note the Channel ID displayed above for further steps."
read -p "Enter the noted Channel ID: " channel_id

#Assign the driver to the channel
./smartthings.exe edge:channels:assign $driver_id $version -C $channel_id

# Get the ID of the Hub and capture the output
./smartthings.exe devices --type=HUB | tee hub_output.json
hub_id=$(jq -r '.[0].deviceId' hub_output.json)
echo "Hub ID: $hub_id"

# Enroll the hub to the channel
./smartthings.exe edge:channels:enroll -C $channel_id $hub_id

./smartthings.exe edge:drivers:install

