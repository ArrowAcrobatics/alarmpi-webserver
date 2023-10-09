/**
 * A vlc instance that is intended for one-shot audio.
 * It does not layer, but rather does 'replace' style overlapping.
 */
import {VlcBridge} from "./vlc-bridge.js";

export class AudioUi {
    constructor(settings, appEvents) {
        this._settings = settings;
        this._events = appEvents;
        this._vlc = new VlcBridge();

        this.enableEventHandlers();
    }

    enableEventHandlers() {
         this._events.on('ui_short_blip', async () => {
            console.log("AudioUi -> ui_short_blip");
        });

        this._events.on('ui_long_blip', async () => {
            console.log("AudioUi -> ui_long_blip");
        });

        this._events.on("action_up", async () => {
            await this._vlc.volup().catch(e => console.log(`Failed "volup": ${e}`));
        });

        this._events.on("action_down", async () => {
            await this._vlc.voldown().catch(e => console.log(`Failed "voldown": ${e}`));
        });
    }

    async init() {
        await this._vlc.open().catch((e) =>
            console.warn(`Failed to open VLC ${e}`));

        [this._settings.uiSoundLongBlip, this._settings.uiSoundShortBlip].forEach(file => {
            this._vlc.add(file)
                .catch(() =>
                    console.warn(`Failed to add ${file} to playlist`)
                );
        });
    }
};