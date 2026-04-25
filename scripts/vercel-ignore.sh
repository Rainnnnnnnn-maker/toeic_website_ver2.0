#!/bin/bash
# Vercel Ignore Build Step script.
# Exit 1 = run the build. Exit 0 = cancel the build.
#
# Triggers a build when files outside the excluded paths change.
# To skip a build for certain file types, add ':(exclude)<pattern>' below.

# Always build if there is no previous SHA (e.g. first deploy)
[ -z "$VERCEL_GIT_PREVIOUS_SHA" ] && exit 1

git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA" -- \
  . \
  ':(exclude)*.md' \
  ':(exclude).claude/**' \
  ':(exclude).trae/**' \
  ':(exclude).github/**' \
  ':(exclude).gitignore' \
  || exit 1
