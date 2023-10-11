/**
 * Wraps the vlc bridge with a bunch of alarm related features.
 */
import fs from "node:fs/promises";
import {VlcBridge} from "./vlc-bridge.js";

export class AlarmPlayer {
    constructor(settings, appEvents) {
        this._settings = settings;
        this._events = appEvents;
        this._vlc = new VlcBridge();

        this.soundFiles = null;

        this.enableEventHandlers();
    }

    enableEventHandlers() {
        this._events.on('alarmpi-reload', async (alarmsettings) => {
            console.log(`AlarmPlayer.alarmpi-reload: stop`)
            await this._vlc.stop();
            console.log(`AlarmPlayer.alarmpi-reload: clear`)
            await this._vlc.clear();
            console.log(`AlarmPlayer.alarmpi-reload: load`)
            await this.loadPlaylist();
        });

        this._events.on('alarmpi-start', async (alarmsettings) => {
            console.log(`AlarmPlayer.alarmpi-start: play`)
            await this._vlc.play().catch(e => console.log(`Vlc failed "start": ${e}`));
        });

        this._events.on('alarmpi-stop', async (alarmsettings) => {
            console.log(`AlarmPlayer.alarmpi-stop stop`)
            await this._vlc.stop().catch(e => console.log(`Vlc failed "stop": ${e}`));
        });

        this._events.on("action_up", async () => {
            await this._vlc.volup().catch(e => console.log(`Failed "volup": ${e}`));
        });

        this._events.on("action_down", async () => {
            await this._vlc.voldown().catch(e => console.log(`Failed "voldown": ${e}`));
        });

        this._events.on("action_special", async () => {
            await this._vlc.next().catch(e => console.log(`Failed "next": ${e}`));
        });
    }

     async init() {
        await this._vlc.open().catch((e) =>
            console.warn(`Failed to open VLC ${e}`));
        await this.loadPlaylist();
    }

    async loadPlaylist() {
        if(this.soundFiles == null) {
            await fs.readdir(this._settings.alarmSoundFolder)
                .then(soundfiles => this.soundFiles = soundfiles);
        }

        for(const file of this.soundFiles) {
            await this._vlc.add(this._settings.alarmSoundFolder + "/" + file)
                .catch((e) =>
                    console.warn(`Failed to add ${file} to playlist: ${e}`)
                );
        };
    }
}