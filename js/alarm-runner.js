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
       if (verbose) console.log("AlarmRunner.snooze()");

       if(this._snoozeDeferred) {
           this._snoozeDeferred.resolve("snooze");
           this._snoozeDeferred = null;
       } else {
           if (verbose) console.log("AlarmRunner.snooze() called but no snooze deffered scheduled?");
       }
    }

    stop(verbose = true) {
        if (verbose) console.log("AlarmRunner.stop()");
        if(this._stopDeferred) {
            this._stopDeferred.resolve("stop");
            this._stopDeferred = null;
        } else {
           if (verbose) console.log("AlarmRunner.stop() called but no stop deffered scheduled?");
        }
    }

    timeout(verbose = true) {
        if (verbose) console.log("AlarmRunner.timeout()");
        if(this._timeoutDeferred) {
            this._timeoutDeferred.resolve("timeout");
            this._timeoutDeferred = null;
        } else {
            if (verbose) console.log("AlarmRunner.timeout() called but no timeout deffered scheduled?");
        }
    }

    // deferBoilerplate(defer, status, verbose) {
    //     if (verbose) console.log("AlarmRunner.timeout()");
    //     if(this._timeoutDeferred) {
    //         this._timeoutDeferred.resolve("timeout");
    //         this._timeoutDeferred = null;
    //     } else {
    //         if (verbose) console.log("AlarmRunner.timeout() called but no timeout deffered scheduled?");
    //     }
    // }

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
