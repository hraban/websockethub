#!/bin/bash

# Don't ever NOT have this as the first line. Tried to be smart, used the
# safe_mode alias after defining it just below, discovered that aliases are not
# expanded by default in bash the hard way. Lesson learned.
set -eu -o pipefail

alias safe_mode='set -eu -o pipefail'
shopt -s expand_aliases

if [[ -n "${DEBUG-}" ]]
then
	set -x
	alias safe_mode='set -exu -o pipefail'
fi


# No password prompts
alias sudo="sudo -n"
alias aptitude="sudo aptitude --assume-yes"

function log_msg {
	safe_mode
	echo "$@" >&2
}

function echoandexit {
	safe_mode
	log_msg "$@"
	exit 1
}

updated=0
function ensure_fresh_aptsources {
	safe_mode
	if [[ "$updated" -eq 0 ]]
	then
		aptitude update
		updated=1
	fi
}

function apt_install {
	safe_mode
	[[ "$#" -eq 1 ]] || echoandexit "apt_install requires 1 arg"
	ensure_fresh_aptsources
	aptitude install "$1"
}

function has_cmd_raw {
	safe_mode
	[[ "$#" -eq 1 ]] || echoandexit "has_cmd_raw requires 1 arg"
	local name="$1"
	type -t "$name" &>/dev/null || return 1
}

function has_cmd {
	safe_mode
	[[ "$#" -eq 1 ]] || echoandexit "has_cmd requires 1 arg"
	local name="$1"
	if has_cmd_raw "has_$name"
	then
		"has_$name" || return 1
	else
		has_cmd_raw "$name" || return 1
	fi
}

function install_package {
	safe_mode
	[[ "$#" -eq 1 ]] || echoandexit "install_package requires 1 arg"
	local package="$1"
	if has_cmd "install_$package"
	then
		"install_$package"
	else
		apt_install	"$package"
	fi
}

function ensure_cmd {
	safe_mode
	[[ "$#" -eq 2 ]] || echoandexit "ensure_cmd requires 2 args"
	local cmd="$1"
	local package="$2"
	has_cmd "$cmd" && return 0
	install_package "$package"
	has_cmd "$cmd" && return 0
	log_msg "Couldn't find nor install $cmd"
	return 1
}

function check_sha1 {
	safe_mode
	[[ "$#" -eq 2 ]] || echoandexit "check_sha1 requires 2 args"
	local fname="$1"
	local cksum="$2"
	ensure_cmd sha1sum coreutils
	echo "$cksum  $fname" | sha1sum -c --quiet --strict || exit 1
}

function install_awscli {
	safe_mode
	ensure_cmd pip python-pip
	sudo pip install awscli
}
