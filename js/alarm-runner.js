import * as utils from "./utils.js";

/**
 * Responsible for a single alarm instance/moment.
 * Deals with the button UI and operates the VLC bridge.
 */
export class AlarmRunner {
    constructor(settings, appEvents, alarmSettingsJson) {
        // TODO: add scheduler ref for querying current run status.
        this._settings = settings;
        this._alarmConf = alarmSettingsJson;
        this._events = appEvents;
    }

    async run() {
        if(this._settings.verbose) {
            console.log("Running an alarm at " + new Date());
            console.log(this._alarmConf);
        }
        this._events.emit('alarmpi-start', this._alarmConf);

        return new Promise(async (resolve, reject) => {
            // let timeoutP = sleep(maxAlarmTime).then(() => {this.stop; resolve();}));
            // buttonUI.on('stopButton', () => {this.stop; resolve();}));
            // buttonUI.on('snoozeButton' () => { this.snooze();});
            // Use Promise.race(sleep, snooze, stop)?

            await utils.sleep(1000); // debug

            if (this._settings.verbose) {
                console.log("alarm done");
            }
            this.stop();
            resolve();
        });
    }

    stop() {
        // for other alarms to go solo etc.
        this._events.emit('alarmpi-stop', this._alarmConf);
    }
};