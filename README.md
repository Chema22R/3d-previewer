[![Netlify Status](https://api.netlify.com/api/v1/badges/82add870-d40a-4845-ae9c-c79825808ff1/deploy-status)](https://app.netlify.com/sites/3dpreviewer/deploys)
[![dependencies Status](https://david-dm.org/chema22r/3dpreviewer/status.svg)](https://david-dm.org/chema22r/3dpreviewer)
[![devDependencies Status](https://david-dm.org/chema22r/3dpreviewer/dev-status.svg)](https://david-dm.org/chema22r/3dpreviewer?type=dev)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/Chema22R/3dpreviewer.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Chema22R/3dpreviewer/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/Chema22R/3dpreviewer.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Chema22R/3dpreviewer/context:javascript)

# 3D Previewer
This applications is a 3D objects previewer that allows users to interact and carry out certain basic operations on loaded objects,
enabling their analysis in detail.

The main interface (right button) allows users to send an STL, OBJ or PLY object to the server, where its geometry is extracted and
stored. In addition, users can access through the main interface (left button) a list of objects whose geometry is stored on the server,
being able to select or delete the listed objects.

In both ways, users can load an object into the interface, after which users can perform basic operations on the object, such as rotation,
padding or zooming.

Check out a real example of the application from [here](https://3dpreviewer.chema22r.com).

## Setup and Run
1. Download the source code
2. Install the node modules executing `npm run i`
3. Execute one of the following commands
    - `npm start` to run the application in live-reload mode (development)
    - `npm run build` to build the application (production)

## Directories Structure
```
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
    |- package.json
    |- webpack.config.js
    |- webpack.dev.js
    |- webpack.prod.js
|- /server
    |- /src
        |- /app
            |- ...
        |- index.js
    |- package.json
    |- webpack.config.js
    |- webpack.dev.js
    |- webpack.prod.js
|- .gitignore
|- LICENSE
|- logCodes
|- package.json
|- README.md
```