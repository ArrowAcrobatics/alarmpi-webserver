import express from 'express';
import bodyParser from "body-parser";

import * as path from 'path';
import {fileURLToPath} from 'url';

import {AppBackend} from "./js/app-backend.js";
import {AppSettings} from "./js/app-settings.js";

console.log("starting server: " + new Date());
// TODO: automate relaunching on crash/boot with:
// https://dev.to/bogdaaamn/run-your-nodejs-application-on-a-headless-raspberry-pi-4jnn
// https://github.com/Unitech/pm2

// settings & backend
let settings = new AppSettings(path.dirname(fileURLToPath(import.meta.url)));
let backend = new AppBackend(settings);
await backend.init();

// init express app
const app = express();
app.use(express.static(path.join(settings.rootDir, 'static')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// endpoints
app.get("/", (req,res) => backend.onGetIndex(req,res));
app.post("/", (req,res) => backend.onPostAlarm(req,res));
app.post("/vlc", (req,res) => backend.onPostVlcCommand(req,res));
app.post("/gpio", (req,res) => backend.onPostGpioCommand(req,res));

// open port
let server = app.listen(process.env.PORT || 3000, () => {
    console.log("Server became available. ");
});

process.on('SIGINT', _ => {
    // TODO: If this still isn't clean enough there's
    // https://www.npmjs.com/package/express-graceful-exit
    server.close(() => {
        console.log('closed express');
        process.exit();
     });
});
