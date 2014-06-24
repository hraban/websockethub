#!/bin/bash

# Don't ever NOT have this as the first line.
set -eu -o pipefail

source ../utils.sh

GO_VERSION=1.3
GO_INSTALL_DIR="/usr/local"
GO_INSTALLER_SHA1="b6b154933039987056ac307e20c25fa508a06ba6"

GO_INSTALLER_NAME="go$GO_VERSION.linux-amd64.tar.gz"
GO_DOWNLOAD_LOC="http://golang.org/dl/$GO_INSTALLER_NAME"

function download_go {
	safe_mode
	wget --no-verbose "$GO_DOWNLOAD_LOC"
	check_sha1 "$GO_INSTALLER_NAME" "$GO_INSTALLER_SHA1"
}

function install_golang {
	safe_mode
	local d="$(mktemp -d -t "install-go$GO_VERSION-XXXXXXX")"
	(cd "$d" ;
		download_go
		sudo tar xzf "$GO_INSTALLER_NAME" -C "$GO_INSTALL_DIR")
	rm -rf "$d"
	sudo install -o root -g root -m 755 goenv.sh /etc/profile.d/
	ensure_cmd hg mercurial
	ensure_cmd git git
	source /etc/profile.d/goenv.sh
}

function has_go {
	safe_mode
	has_cmd_raw go || return 1
	go version | grep --quiet -F "go$GO_VERSION" || return 1
	# safe_mode makes these crash the script if unset
	[[ "$GOROOT" ]]
	[[ "$GOPATH" ]]
}

ensure_cmd go golang
