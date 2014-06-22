#!/bin/bash

# Don't ever NOT have this as the first line.
set -eu -o pipefail

source utils.sh

HUB_CONTROLPANEL_PASSWORD="${1-$RANDOM$RANDOM$RANDOM$RANDOM}"
HUBARGS="-l 0.0.0.0:8282 -p $HUB_CONTROLPANEL_PASSWORD"

if [[ -z "$HUB_CONTROLPANEL_PASSWORD" ]]
then
	echoandexit "HUB_CONTROLPANEL_PASSWORD variable is empty"
fi

ensure_cmd go golang
go get -u github.com/nobullshitsoftware/websockethub/hub
hubcmd="${GOPATH%%:*}/bin/hub"
[[ -f "$hubcmd" ]] || echoandexit "hub executable not found at $hubcmd"
ensure_cmd timeout coreutils
timeout 3 killall -w hub || echo "Failed to kill running hub, starting anyway"
# TODO: daemon monitor
nohup "$hubcmd" $HUBARGS &
pid=$!
sleep 1
echo Started hub, pid $pid
exit 0
