#!/bin/bash

# Sets up Go environment: GOROOT and GOPATH
# For /etc/profile.d/

if [[ -d "/usr/local/go" ]]
then
	export GOROOT=/usr/local/go
	export GOPATH=$HOME/go
	export PATH="$PATH:$GOROOT/bin"
fi
