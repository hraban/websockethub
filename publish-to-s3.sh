#!/bin/bash

# Don't ever NOT have this as the first line.
set -eu -o pipefail

source utils.sh

function publish_to_s3 {
	safe_mode
	ensure_cmd aws awscli
	[[ "$#" -eq 2 ]] || echoandexit "publish_to_s3 requires 2 args"
	folder="$1"
	bucket="$2"
	# Dry runs will crash the script if it foresees problems
	AWS_OPTS="--delete --acl public-read"
	aws s3 sync --dryrun $AWS_OPTS "$folder" "$bucket"
	aws s3 sync $AWS_OPTS "$folder" "$bucket"
}

[[ -d .git ]] || echoandexit "Must be run from git directory"

# Prepare contents

d="$(mktemp -d -t websockethub.com-static-XXXXXXXXX)"
RELEASE_BRANCH=master
ensure_cmd git git
git archive --format=tar "$RELEASE_BRANCH" | tar x -C "$d"
cd "$d"

# Try uploading static content to s3

publish_to_s3 www/ s3://www.websockethub.com
publish_to_s3 static/ s3://static.websockethub.com

cd /
rm -rf "$d"
