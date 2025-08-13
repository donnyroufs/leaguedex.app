
#!/bin/bash
# bump-version.sh - Bump version and create tag

VERSION=$1
if [ -z "$VERSION" ]; then
    echo "Usage: ./bump-version.sh <version>"
    echo "Example: ./bump-version.sh 0.0.33"
    exit 1
fi

# Update package.json version
npm version $VERSION --no-git-tag-version

# Commit the version change
git add package.json
git commit -m "Bump version to $VERSION"

# Create and push tag
git tag v$VERSION
git push origin main
git push origin v$VERSION

echo "Version bumped to $VERSION and pushed to origin"