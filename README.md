# 3D Previewer
This applications is a 3D objects previewer that allows users to interact and carry out certain basic operations on loaded objects,
enabling their analysis in detail.

The main interface (right button) allows users to send an STL, OBJ or PLY object to the server, where its geometry is extracted and
stored. In addition, users can access through the main interface (left button) a list of objects whose geometry is stored on the server,
being able to select or delete the listed objects.

In both ways, users can load an object into the interface, after which users can perform basic operations on the object, such as rotation,
padding or zooming.

Check out a real example of the application from [here](http://chema22r.duckdns.org/3dpreviewer).

## Setup and Run
1. Download the source code
2. Do the following from inside the *server* folder:
    - Install the node modules executing `npm i`
    - Execute one of the following commands:
        - `npm start` to run the application in live-reload mode (development)
        - `npm run build` to build the application (production)
3. Do the following from inside the *client* folder:
    - Install the node modules executing `npm i`
    - Execute one of the following commands:
        - `npm start` to build the application (development)
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
|- logCodes
|- README.md
```