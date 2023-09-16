import express from 'express';
import bodyParser from "body-parser";

import * as path from 'path';
import {fileURLToPath} from 'url';

import {AppBackend} from "./js/app-backend.js";
import {AppSettings} from "./js/app-settings.js";

console.log("starting server: " + new Date());

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
app.listen(process.env.PORT || 3000, () => {
    console.log("Server became available. ");
});