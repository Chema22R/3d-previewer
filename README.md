[![Netlify Status](https://api.netlify.com/api/v1/badges/82add870-d40a-4845-ae9c-c79825808ff1/deploy-status)](https://app.netlify.com/sites/3d-previewer/deploys)
[![CodeQL](https://github.com/Chema22R/3d-previewer/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/Chema22R/3d-previewer/actions/workflows/codeql-analysis.yml)
[![MIT License](https://camo.githubusercontent.com/d59450139b6d354f15a2252a47b457bb2cc43828/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f6c2f7365727665726c6573732e737667)](LICENSE)

# 3D Previewer
This application is a 3D objects previewer that allows users to interact and carry out certain basic operations on loaded objects, enabling their analysis in detail.

The main interface has only two buttons. The upper right one allows users to send an STL, OBJ or PLY object to the server, where its geometry is extracted, processed and stored. In addition, users can access through the upper left button a list of objects whose geometry is already stored on the server, being able to select or delete the listed elements.

In both ways, users can load an object into the interface, after which they can perform basic operations on the object, such as rotation, padding or zooming.

Check out a real example of the application from [here](https://3d-previewer.chema22r.com).

## Setup and Run
1. Download the source code
2. Install the node modules executing `npm run i`
3. Fill the server .env credentials.
4. Execute one of the following commands to build the application
    - `npm run build` (production)
    - `npm run build-dev` (development)
5. The build code can be found in `./client/dist` and `./server/dist`

## Directory Structure
```
|- /.dependabot
    |- ...
|- /.github
    |- ...
|- /client
    |- /src
        |- /app
            |- ...
        |- /assets
            |- /favicons
                |- ...
            |- /icons
                |- ...
            |- /images
                |- ...
            |- /style
                |- ...
        |- index.html
        |- index.js
    |- package-lock.json
    |- package.json
    |- webpack.config.js
    |- webpack.dev.js
    |- webpack.prod.js
|- /server
    |- files_default
    |- /src
        |- /app
            |- ...
        |- index.js
    |- example.env
    |- package-lock.json
    |- package.json
    |- webpack.config.js
    |- webpack.dev.js
    |- webpack.prod.js
|- .gitignore
|- LICENSE
|- package-lock.json
|- package.json
|- Procfile
|- README.md
```
