import pug from 'pug';
import * as fs from 'node:fs/promises';

import {VlcBridge} from "./vlc-bridge.js";
import {AlarmScheduler} from "./alarm-scheduler.js";
import {AlarmStorage} from "./alarm-storage.js";

export class AppBackend {
    constructor(settings) {
        this.settings = settings;
        this.vlcbridge = new VlcBridge(settings);
        this.alarmStorage = new AlarmStorage(settings);
        this.alarmScheduler = new AlarmScheduler(this.vlcbridge, settings);
        this.pugRenderAlarmsPage = null;
    }

    async init() {
        await this.initPug();
        await this.initVlc();
    }

    async initVlc() {
        await this.vlcbridge.open().catch((e) =>
            console.warn(`Failed to open VLC ${e}`));

        // load the sound files into the vlc bridge.
        fs.readdir(this.settings.alarmSoundFolder)
            .then(soundfiles => {
                soundfiles.forEach(file => {
                    this.vlcbridge.add(this.settings.alarmSoundFolder + "/" + file)
                        .then(() => {
                            console.log("added " + file + " to playlist");
                        })
                        .catch(() =>
                            console.warn(`Failed to add ${file} to playlist`)
                        );
                });
            });
    }

    /**
     * Constructs rendering funcs for back-/frontend and .js file for static front end loading.
     * Async because of file operations.
     * @returns {Promise<void>}
     */
    async initPug() {
        // pug init
        let pugAlarmClientFile = 'alarm-client';
        let pugAlarmClientFileOrig = 'html/' + pugAlarmClientFile + '.pug';
        let pugAlarmClientFileGen = 'static/js/gen/' + pugAlarmClientFile + '.js';
        let pugAlarmClientFuncName = "CreateAlarmWidget";

        let pugOptions = {basedir: this.settings.rootDir};

        // noinspection JSCheckFunctionSignatures
        this.pugRenderAlarmsPage = pug.compileFile('html/alarms.pug', pugOptions);

        let pugRenderAlarmClientJsStr = pug.compileFileClient(pugAlarmClientFileOrig,
                                            Object.assign({name: pugAlarmClientFuncName}, pugOptions));

        // fragile hack: add export to pug func for portability. (Might break on pug update)
        let unexportedname = "function " + pugAlarmClientFuncName;
        let exportedname = "export " + unexportedname;
        pugRenderAlarmClientJsStr = pugRenderAlarmClientJsStr.replace(unexportedname,exportedname);

        // generate front end javascript for pug
        await fs.writeFile(pugAlarmClientFileGen, pugRenderAlarmClientJsStr);
    }

    /**
     * Get request handler: Renders the alarms view from disk.
     */
    async onGetIndex(request, response) {
        console.log("get request: / from: " + request.headers.host);
        response.send(this.pugRenderAlarmsPage(await this.alarmStorage.getAlarms()));
    }

    /**
     * Post request handler: Writes new alarm settings to disk.
     */
    async onPostAlarm(request, response) {
        console.log("post request: / from: " + request.headers.host);
        this.alarmStorage.setAlarms(request.body)
            .then(() => {
                response.status(200).json({
                    status: "success",
                    timestamp: Date.now(),
                });
            })
            .catch(err => console.log("failed setting alarms!"));
    }

    /**
     * Post request handler: Executes a VLC command (if backend is available).
     */
    async onPostVlcCommand(request, response) {
        console.log("post request: /vlc from: " + request.headers.host);
        console.log(request.body);

        this.execVlcCommand(request.body)
            .then(() => {
                response.status(200).json({
                    status: "success",
                    timestamp: Date.now(),
                });
            })
            .catch(err => console.log("failed to handle vlc command"));
    }

    async execVlcCommand(vlcJson) {
        // TODO: propagate possible failure to execute
        switch (vlcJson.cmd) {
            case "open":
                await this.vlcbridge.open();
                break;
            case "close":
                await this.vlcbridge.close();
                break;
            case "play":
                await this.vlcbridge.play();
                break;
            case "pause":
                await this.vlcbridge.pause();
                break;
            default:
                console.log("vlc cmd not implemented");
        }
    }
}