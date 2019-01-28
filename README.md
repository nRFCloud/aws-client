# AWS Client

## Backstory
We have to keep our AWS dependencies in a separate repo becuase our build process OOMs when attempt to include the assets in the main repo. See more details [here](https://projecttools.nordicsemi.no/jira/browse/IRIS-921)

## Scripts
```sh
# dev - build ./dist/aws-wrapper.js and copy to ../nrfcloud-web-frontend/dist/aws-wrapper.min.js
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
