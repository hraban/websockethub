#!/bin/bash

# Don't ever NOT have this as the first line.
set -eu -o pipefail

source utils.sh

upload_and_run_script updatewebsockethub-locally.sh websockethub@vps4.luyat.com
