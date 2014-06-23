#!/bin/bash

# Don't ever NOT have this as the first line.
set -eu -o pipefail

source utils.sh

HUBARGS="-l 0.0.0.0:8181 -p $RANDOM$RANDOM$RANDOM$RANDOM -v"

log_msg "Downloading and installing websockethub software."
go get -u github.com/nobullshitsoftware/websockethub/hub
hubcmd="${GOPATH%%:*}/bin/hub"
[[ -f "$hubcmd" ]] || echoandexit "hub executable not found at $hubcmd"
screen -d -m -S websockethub
# Give screen some time to start
sleep 1
log_msg "Starting websocketub in screen session"
screen -S websockethub -X stuff "until '$hubcmd' $HUBARGS
do
	sleep 1
done
"
