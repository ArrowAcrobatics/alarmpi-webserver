import express from 'express';
import bodyParser from "body-parser";
import pug from 'pug';
import * as fs from 'node:fs/promises';

import * as path from 'path';
import {fileURLToPath} from 'url';
import {VlcBridge} from "./js/vlc-bridge.js";

console.log("starting server: " + new Date());

// settings
let rootDir = path.dirname(fileURLToPath(import.meta.url));
let pugOptions = {basedir: rootDir};
let alarmFileRead = 'alarms/alarms.json';
let alarmFileWrite = 'alarms/alarms-pending-update.json';

let pugAlarmClientFile = 'alarm-client';
let pugAlarmClientFileOrig = 'html/' + pugAlarmClientFile + '.pug';
let pugAlarmClientFileGen = 'static/js/gen/' + pugAlarmClientFile + '.js';
let pugAlarmClientFuncName = "CreateAlarmWidget";

// noinspection JSCheckFunctionSignatures
let pugRenderAlarmsPage = pug.compileFile('html/alarms.pug', pugOptions);

let pugRenderAlarmClientJsStr = pug.compileFileClient(pugAlarmClientFileOrig,
    Object.assign({name: pugAlarmClientFuncName}, pugOptions));

// fragile hack: add export to pug func for portability. (Might break on pug update)
let unexportedname = "function "+pugAlarmClientFuncName;
let exportedname = "export " + unexportedname;
pugRenderAlarmClientJsStr = pugRenderAlarmClientJsStr.replace(unexportedname,exportedname);

await fs.writeFile(pugAlarmClientFileGen, pugRenderAlarmClientJsStr);


async function getAlarms() {
    try {
        const data = await fs.readFile(alarmFileRead, {encoding: 'utf8'});
        const contents = JSON.parse(data);
        return contents;
    } catch (err) {
        console.error(err.message);
    }

    return {};
}

async function setAlarms(alarmsJson) {
    let jsonstr = JSON.stringify(alarmsJson, undefined, 4);
    // console.log(jsonstr);
    await fs.writeFile(alarmFileWrite, jsonstr)
        .then(async () =>
            await fs.rename(alarmFileWrite, alarmFileRead));
    console.log(alarmFileRead + " updated");
}


// init express app
const app = express();
app.use(express.static(path.join(rootDir, 'static')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


// init vlc
const vlcbridge = new VlcBridge(true);
// TODO: add media

async function execVlcCommand(vlcJson) {
    return;
    switch(vlcJson.cmd){
        case "open":
            await vlcbridge.open();
            break;
        case "close":
            await vlcbridge.close();
            break;
        case "play":
            await vlcbridge.play();
            break;
        case "pause":
            await vlcbridge.pause();
            break;
        default:
            console.log("vlc cmd not implemented"); // TODO: throw instead
    }
}

// endpoints
app.get("/", async (request, response) => {
    console.log("get request: / from: " + request.headers.host);
    response.send(pugRenderAlarmsPage(await getAlarms()));
});

app.post("/", async (request, response) => {
    console.log("post request: / from: " + request.headers.host);
    setAlarms(request.body)
        .then(() => {
            response.status(200).json({
                status: "success",
                timestamp: Date.now(),
            });
        })
        .catch(err => console.log("failed setting alarms!"));
});

app.post("/vlc", async (request, response) => {
    console.log("post request: /vlc from: " + request.headers.host);
    console.log(request.body);

    execVlcCommand(request.body)
        .then(() => {
            response.status(200).json({
                status: "success",
                timestamp: Date.now(),
            });
        })
        .catch(err => console.log("failed to handle vlc command"));
});

// open port
app.listen(process.env.PORT || 3000, () => {
    console.log("Server became available. ");
});