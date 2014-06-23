#!/bin/bash

# Don't ever NOT have this as the first line.
set -eu -o pipefail

cd "$(dirname "$0")"
source ../utils.sh

if [[ "$(whoami)" != root ]]
then
	echoandexit "$0 must be run as root"
fi

./install-go.sh
ensure_cmd screen screen

log_msg "creating user websockethub"
useradd -m websockethub
passwd -d websockethub
chsh -s /bin/bash websockethub
install -o websockethub -g websockethub -m 755 ../utils.sh run-as-websockethub.sh ~websockethub/
log_msg "dropping privileges"
su - -c "~/run-as-websockethub.sh" websockethub