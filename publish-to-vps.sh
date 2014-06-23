#!/bin/bash

# Don't ever NOT have this as the first line.
set -eu -o pipefail

source utils.sh

[[ "$#" -eq 1 ]] || echoandexit "usage: $0 HOSTNAME"
host="$1"

function upload_and_run_directory {
	safe_mode
	[[ "$#" -eq 2 ]] || echoandexit "upload_and_run_directory requires 2 args"
	local dir="$1"
	local host="$2"
	local startscript="$dir/run.sh"
	[[ -d "$dir" ]] || echoandexit "upload_and_run_directory: $dir does not exist"
	[[ -f "$startscript" ]] || echoandexit "upload_and_run_directory: $startscript does not exist"
	# For now dependencies are easy: utils.sh is the only one for any script
	local dependencies="utils.sh"
	ensure_cmd scp openssh-client
	scp -r $dependencies "$dir" "$host":
	ssh "$host" "./'$startscript'"
}

upload_and_run_directory "install-hub-debian/" root@"$host"
