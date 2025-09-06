#!/bin/bash
# bump-version.sh - Bump version and create tag

TYPE=$1
if [ -z "$TYPE" ]; then
    echo "Usage: ./bump-version.sh <type>"
    echo "Type must be one of: major, minor, patch"
    exit 1
fi

if [ "$TYPE" != "major" ] && [ "$TYPE" != "minor" ] && [ "$TYPE" != "patch" ]; then
    echo "Type must be one of: major, minor, patch"
    exit 1
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Error: Must be on main branch to bump version"
    exit 1
fi

# Update package.json version
npm version $TYPE --no-git-tag-version

# Get the new version from package.json
VERSION=$(node -p "require('./package.json').version")

# Commit the version change
git add package.json
git commit -m "Bump version to $VERSION"

# Create and push tag
git tag v$VERSION
git push origin main
git push origin v$VERSION

echo "Version bumped to $VERSION and pushed to origin"