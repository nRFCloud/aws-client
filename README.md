# AWS Client

<!-- toc -->

- [History](#history)
- [Deploying](#deploying)
  * [1. Create a tag](#1-create-a-tag)
  * [2. Build](#2-build)
  * [3. Make a release](#3-make-a-release)
- [Versioning](#versioning)
- [Scripts](#scripts)
- [Usage](#usage)

<!-- tocstop -->

## History
We have to keep our AWS dependencies in a separate repo becuase our build process OOMs when attempt to include the assets in the main repo. See more details [here](https://projecttools.nordicsemi.no/jira/browse/IRIS-921).

## Deploying
### 1. Create a tag
```sh
# bump the version, creates a tag, write it to package.json, and commit
npm version <major|minor|patch>

# major 1.5.3 => 2.0.0 - backwards incompatible change
# minor 1.5.3 => 1.6.0 - feature
# patch 1.5.3 => 1.5.4 - bug fix
```
  
### 2. Build
```sh
# build the files
npm run build:dev && npm run build:production

# ------ OR --------

# build and copy the files to ../nrfcloud-web-frontend
npm run all

# add files and commit
git commit -am "<my commit message>"

# re-tag (this is dumb but necessary since our build assets are committed)
git tag -f $(git describe --abbrev=0 --tags)

# push commits
git push origin HEAD

# push tags
git push origin --tags

# There's a way to push both commits and tags with one command, if you're into that. https://stackoverflow.com/questions/3745135/push-git-commits-tags-simultaneously
```

### 3. Make a release
Go to [the releases page](https://github.com/nRFCloud/aws-client/releases), find the most recent tag, and follow the steps to make a release

## Versioning
We use [Semantic Versioning](https://semver.org) rules. 

`npm version` is used to manage tags/package.json. See [here](#1-create-a-tag) for details.

The build process automatically inserts the version number from `package.json` into the built files (this is for a version checking process on the [the Iris Frontend project](https://github.com/NordicPlayground/nrfcloud-web-frontend)).

## Scripts
```sh
# builds and copies both dev and production
npm run all

# dev - build ./dist/aws-wrapper.js and copy to ../nrfcloud-web-frontend/dist/aws-wrapper.js
npm run dev

# production - build ./dist/aws-wrapper.min.js and copy to ../nrfcloud-web-frontend/dist/aws-wrapper.min.js
npm run production

# build
npm run build:<dev|production>

# copy
npm run copy:<dev|production>
```

## Usage 
The built assets are intended to be used in the [the Iris Frontend project](https://github.com/NordicPlayground/nrfcloud-web-frontend).
