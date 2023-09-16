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
        this._timeoutDeferred = null;
    }

    snooze(verbose = true){
       this.deferBoilerplate("_snoozeDeferred", verbose);
    }

    stop(verbose = true) {
        this.deferBoilerplate("_stopDeferred", verbose);
    }

    timeout(verbose = true) {
        this.deferBoilerplate("_timeoutDeferred", verbose);
    }

    deferBoilerplate(defer, verbose) {
        if (verbose) console.log("AlarmRunner.timeout()");
        if(this[defer]) {
            this[defer].resolve();
            this[defer] = null;
        } else {
            if (verbose) console.log(`AlarmRunner.${defer}() called but its deferred is null?`);
        }
    }

    async waitForStop() {
        await this._stopDeferred.promise;
        return "stop";
    }

    async waitForSnooze() {
        await this._snoozeDeferred.promise;
        return "snooze";
    }

    async waitForTimeout() {
        await this._timeoutDeferred.promise;
        return "time-out";
    }

    // _must_ be reset before reassigning stopResolved to prevent memory leaks!
    createDeferredPromises() {
        // console.log(`AlarmRunning.createDeferredPromises()`);
        // console.log(`Before: snooze: ${this._snoozeDeferred != null}, stop: ${this._stopDeferred != null}, timeout: ${this._timeoutDeferred != null}`);
        this._snoozeDeferred = new utils.Deferred();
        this._stopDeferred = new utils.Deferred();
        this._timeoutDeferred = new utils.Deferred((resolve, reject) => {
            utils.sleep(10000).then(resolve);
        });
        // console.log(`Afterwards: snooze: ${this._snoozeDeferred != null}, stop: ${this._stopDeferred != null}, timeout: ${this._timeoutDeferred != null}`);
    }

    resetDeferredPromises() {
        this.stop(false);
        this.snooze(false);
        this.timeout(false);
    }


    async run() {
        if (this._settings.verbose) {
            console.log("Running an alarm at " + new Date());
            // console.log(this._alarmConf);
        }

        this._events.emit('alarmpi-start', this._alarmConf);

        // TODO: while(restartCounter > 0)
        this.createDeferredPromises();
        await Promise.race([
            this.waitForStop(),
            this.waitForSnooze(),
            this.waitForTimeout()
        ]).then((status) => {
            this.resetDeferredPromises();
            console.log(`alarm.run ended because of ${status}`);
            // TODO: handle cases per status.
        });

        if (this._settings.verbose) {
            console.log("alarm done");
        }

        // todo: vlc stop.
        // this.stop();
    }

}
