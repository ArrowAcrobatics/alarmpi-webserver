import pug from 'pug';
import * as fs from 'node:fs/promises';

import {VlcBridge} from "./vlc-bridge.js";
import {AlarmScheduler} from "./alarm-scheduler.js";
import {Storage} from "./storage.js";
import {GpioHandler} from "./gpio-handler.js";

import { EventEmitter } from 'node:events';
import {AudioUi} from "./audio-ui.js";
import {AlarmPlayer} from "./audio-alarm-player.js";

class AppBackendEmitter extends EventEmitter {};

export class AppBackend {
    constructor(settings) {
        this.settings = settings;
        this.pugRenderAlarmsPage = null;
        this.pugRenderSettingsPage = null;

        this._events = new AppBackendEmitter();

        this.alarmScheduler = new AlarmScheduler(settings, this._events);
        this.alarmStorage = new Storage(settings, this._events);
        this.gpioHandler = new GpioHandler(settings, this._events);
        this.alarmPlayer = new AlarmPlayer(settings, this._events);
        this.audioUi = new AudioUi(settings, this._events);
    }

    async init() {
        await this.initPug();
        await this.alarmPlayer.init();
        await this.audioUi.init();

        this.gpioHandler.init();

        this.alarmScheduler.load(await this.alarmStorage.getAlarms());
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
        this.pugRenderSettingsPage = pug.compileFile('html/settings.pug', pugOptions);

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
     * Get request handler: Renders the settings view from disk.
     */
    async onGetSettings(request, response) {
        console.log("get request: /settings from: " + request.headers.host);
        response.send(this.pugRenderSettingsPage());
    }

    /**
     * Post request handler: Writes new alarm settings to disk.
     */
    async onPostAlarm(request, response) {
        console.log("post request: / from: " + request.headers.host);
        // TODO: validate alarm data format?
        this.alarmStorage.setAlarms(request.body)
            .then(() => {
                response.status(200).json({
                    status: "success",
                    timestamp: Date.now(),
                });
            })
            .then( () => this.alarmScheduler.load(request.body))
            .then( () => this._events.emit('ui_long_blip'))
            .catch(err => console.log("failed setting alarms!"));
    }

    /**
     * Post request handler: Emulates a gpio button press
     */
    async onPostGpioCommand(request, response) {
        console.log("post request: /gpio from: " + request.headers.host);

        this.gpioHandler.execBackendCommand(request.body)
            .then(
                response.status(200).json({
                    status: "success",
                    timestamp: Date.now(),
                })
            )
            .catch(
                err => console.log(`failed to handle gpio command: ${err}`)
            );
    }

    /**
     * Post request handler: Executes a VLC command (if backend is available).
     */
    async onPostVlcCommand(request, response) {
        console.log("post request: /vlc from: " + request.headers.host);

        this.alarmPlayer.execBackendCommand(request.body)
            .then(
                response.status(200).json({
                    status: "success",
                    timestamp: Date.now()
                })
            )
            .catch(err => console.log("failed to handle vlc command"));
    }
}