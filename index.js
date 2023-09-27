import express from 'express';
import bodyParser from "body-parser";

import {Gpio} from 'onoff';

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

// gpio
let buttons = new Map();
[0, 2, 3, 5, 6].forEach((gpiopinid) => {
    buttons.set(`pin_id#${gpiopinid}`, new Gpio(gpiopinid, 'in', 'both', {debounceTimeout: 10}));
});

buttons.forEach((button, name, map) => {
    console.log(`adding watch for ${name}`);
    button.watch((err, value) => {
        console.log(`button ${name} callback called: ${value}`);
        if (err) {
            throw err;
        }
    });
});

process.on('SIGINT', _ => {
    console.log("deregister buttons.");
    buttons.forEach((button, name, map) => button.unexport());
});

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
app.listen(process.env.PORT || 3000, () => {
    console.log("Server became available. ");
});
