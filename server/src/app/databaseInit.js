"use strict";

const fs = require("fs");
const Geometry = require("./geometryModel.js");

const filesDir = "./files";
const defaultFilesDir = "./files_default";
const defaultFiles = [
    {
        "_id" : "5d72c81e1361090919982088",
        "name" : "Deathly Hallows.stl",
        "path" : "./files/e7dfdc6b-4a71-4892-a6c0-d135395493a6"
    },
    {
        "_id" : "5d72c8291361090919982089",
        "name" : "Low Poly Skull.stl",
        "path" : "./files/251a7346-f0f2-4f0d-bd6d-b288092d59ae"
    },
    {
        "_id" : "5d72c831136109091998208a",
        "name" : "Porche.ply",
        "path" : "./files/debb0977-74d2-4d9f-9e39-eb4ec7512685"
    },
    {
        "_id" : "5d72c83b136109091998208b",
        "name" : "Porsche 911.obj",
        "path" : "./files/44181462-d8c1-4d9a-9d59-a8628a9e5e31"
    },
    {
        "_id" : "5d72c844136109091998208c",
        "name" : "Trumpet.obj",
        "path" : "./files/c1cfddf6-f6d1-48ad-ba75-e52e546739ec"
    },
    {
        "_id" : "5d72c849136109091998208d",
        "name" : "Turbine.ply",
        "path" : "./files/fef829e0-e6d2-47c7-8c9e-1742ec51f591"
    }
];


exports.deleteOldRecords = (app) => {
    Geometry.deleteMany({}, (error) => {
        if (error) {
            app.locals.logger.error("Initialization: Error formatting 'Geometries' collection", {meta: {error: error.message}});
            console.error("- ERROR formatting 'Geometries' collection\n     " + error.message);
        } else {
            fs.readdir(filesDir, (error, files) => {
                if (error) {
                    app.locals.logger.error("Initialization: Error formatting '" + filesDir + "' directory", {meta: {error: error.message}});
                    console.error("- ERROR formatting '" + filesDir + "' directory\n     " + error.message);
                } else {
                    for (let file of files) {
                        fs.unlinkSync(filesDir + "/" + file);
                    }
                    app.locals.logger.log("Initialization: Formatted 'Geometries' collection and '" + filesDir + "' directory", {meta: {filesCount: files.length}});
                    console.log("> Formatted 'Geometries' collection and '" + filesDir + "' directory (" + files.length + " files)");
                }
            });
        }
    });
};


exports.loadDefaultDB = (app) => {
    Geometry.insertMany(defaultFiles, function(error, docs) {
        if (error) {
            app.locals.logger.error("Initialization: Error adding default files to 'Geometries' collection", {meta: {error: error.message}});
            console.error("- ERROR adding default files to 'Geometries' collection\n     " + error.message);
        } else {
            fs.readdir(defaultFilesDir, (error, files) => {
                if (error) {
                    app.locals.logger.error("Initialization: Error copying default files to '" + filesDir + "' directory", {meta: {error: error.message}});
                    console.error("- ERROR copying default files to '" + filesDir + "' directory\n     " + error.message);
                } else {
                    for (let file of files) {
                        fs.copyFileSync(defaultFilesDir + "/" + file, filesDir + "/" + file);
                    }
                    app.locals.logger.log("Initialization: Default files added to 'Geometries' collection and to '" + filesDir + "' directory", {meta: {filesCount: files.length}});
                    console.log("> Default files added to 'Geometries' collection and to '" + filesDir + "' directory (" + files.length + " files)");
                }
            });
        }
    });
};