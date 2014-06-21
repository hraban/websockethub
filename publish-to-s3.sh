#!/bin/bash

# Don't ever NOT have this as the first line. Tried to be smart, used the
# safe_mode alias after defining it just below, discovered that aliases are not
# expanded by default in bash the hard way. Lesson learned.
set -eu -o pipefail

unalias -a
alias safe_mode='set -eu -o pipefail'
shopt -s expand_aliases


function echoandexit {
	safe_mode
	echo "$@" >&2
	exit 1
}

updated=0
function ensure_fresh_aptsources {
	safe_mode
	if [[ "$updated" -eq 0 ]]
	then
		sudo aptitude update
		updated=1
	fi
}

function install_pip {
	safe_mode
	sudo aptitude --assume-yes update
	sudo aptitude --assume-yes install python-pip
}

alias has_pip='[[ -f "$(which pip)" ]]'

function ensure_pip {
	safe_mode
	has_pip && return 0
	install_pip
	has_pip && return 0
	echoandexit "Couldn't find nor install pip"
}

function install_awscli {
	safe_mode
	ensure_pip
	sudo pip install awscli
}

alias has_awscli='[[ -f "$(which aws)" ]]'

function ensure_awscli {
	safe_mode
	has_awscli && return 0
	install_awscli
	has_awscli && return 0
	echoandexit "Couldn't find nor install awscli"
}

[[ -d .git ]] || echoandexit "Must be run from git directory"

# Prepare contents

ensure_awscli
d="$(mktemp -d -t websockethub.com-XXXXXXXXX)"
RELEASE_BRANCH=master
git archive --format=tar "$RELEASE_BRANCH" | tar x -C "$d"
cd "$d"

# Try uploading static content to s3

# Dry runs will crash the script if it foresees problems
AWS_OPTS="--delete --acl public-read"
aws s3 sync --dryrun $AWS_OPTS www/ s3://www.websockethub.com
aws s3 sync --dryrun $AWS_OPTS static/ s3://static.websockethub.com
aws s3 sync $AWS_OPTS www/ s3://www.websockethub.com
aws s3 sync $AWS_OPTS static/ s3://static.websockethub.com

cd /
rm -rf "$d"
