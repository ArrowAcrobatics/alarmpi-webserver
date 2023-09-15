import * as utils from "./utils.js";
import {Deferred} from "./utils.js";

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

        this._snoozeDeferred = null;
        this._stopDeferred = null;
        this._status = null;
    }

    snooze(verbose = true){
       if (verbose) console.log("AlarmRunner.snooze()");

       if(this._snoozeDeferred) {
           this._status = "snooze";
           this._snoozeDeferred.resolve("snooze");
           this._snoozeDeferred = null;
       } else {
           if (verbose) console.log("no snooze deffered scheduled?");
       }
    }

    stop(verbose = true) {
        if (verbose) console.log("AlarmRunner.stop()");
        if(this._stopDeferred) {
            this._status = "stop";
            this._stopDeferred.resolve("stop");
            this._stopDeferred = null;
        } else {
           if (verbose) console.log("no stop deffered scheduled?");
        }
    }

    timeout(verbose = true) {
        if (verbose) console.log("AlarmRunner.timeout()");
        if(this._timeoutDeferred) {
            this._status = "stop";
            this._timeoutDeferred.resolve("timeout");
            this._timeoutDeferred = null;
        } else {
            if (verbose) console.log("no timeout deffered scheduled?");
        }
    }

    // _must_ be resolved before reassigning snoozeResolved to prevent memory leaks!
    async waitForStop() {
        this._stopDeferred = new utils.Deferred();
        await this._stopDeferred.promise;
        return "stop";
    }

    // _must_ be resolved before reassigning stopResolved to prevent memory leaks!
    async waitForSnooze() {
        this._snoozeDefered = new utils.Deferred();
        await this._snoozeDefered.promise;
        return "snooze";
    }

    // _must_ be resolved before reassigning stopResolved to prevent memory leaks!
    async waitForTimeout() {
        this._timeoutDeferred = new utils.Deferred((resolve, reject) => {
            utils.sleep(10000).then(resolve);
        });
        await this._timeoutDeferred.promise;
        return "time-out";
    }
    
    async run() {
        if (this._settings.verbose) {
            console.log("Running an alarm at " + new Date());
            // console.log(this._alarmConf);
        }

        this._events.emit('alarmpi-start', this._alarmConf);

        // TODO: while(restartCounter > 0)
        await Promise.race([
            this.waitForStop(),
            this.waitForSnooze(),
            this.waitForTimeout()
        ]).then((status) => {
            console.log(`alarm.run ended because of ${status} (${this._status})`);
            // resolve other promises
            this.stop(false);
            this.snooze(false);
            this.timeout(false);
            console.log("cleared deferred promises.");
        });

        if (this._settings.verbose) {
            console.log("alarm done");
        }

        // todo: vlc stop.
        // this.stop();
    }

};