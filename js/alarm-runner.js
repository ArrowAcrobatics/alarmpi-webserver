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

        this._snoozeResolved = null;
        this._stopResolved = null;
        this._status = null;
    }

    snooze(){
       console.log("alarm snoozed using button");
       if(this._snoozeResolved) {
           this._status = "snooze";
           this._snoozeResolved("snooze");
       }
    }

    stop() {
        console.log("AlarmRunner.stop()");
        if(this._stopResolved) {
            this._status = "stop";
            this._stopResolved("stop");
        }
    }

    // _must_ be resolved before reassigning snoozeResolved to prevent memory leaks!
    async waitForSnooze() {
        let _this = this;
        await new Promise((resolved, rejected) => { _this._snoozeResolved = resolved; });
    }

    // _must_ be resolved before reassigning stopResolved to prevent memory leaks!
    async waitForStop() {
        let _this = this;
        await new Promise((resolved, rejected) => { _this._stopResolved = resolved; });
    }

    async waitForTimeout() {
        await utils.sleep(10000);
        return "time-out";
    }

    async run() {
        if (this._settings.verbose) {
            console.log("Running an alarm at " + new Date());
            console.log(this._alarmConf);
        }

        this._events.emit('alarmpi-start', this._alarmConf);

        // TODO: while(restartCounter > 0)
        let cancelToken = {cancelled: false};
        await Promise.race([
            this.waitForSnooze(),
            this.waitForStop(),
            this.waitForTimeout()
        ]).then((status) => {
            console.log(`alarm.run ended because of ${status} (${this._status})`);
            // resolve other promises
        });

        if (this._settings.verbose) {
            console.log("alarm done");
        }

        this.stop();
    }

};