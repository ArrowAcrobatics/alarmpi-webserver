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

        this._STATUS_STOP = "stop";
        this._STATUS_SNOOZE = "snooze";
        this._STATUS_TIMEOUT = "timeout";
        this._RESTART_COUNT = 4;
        this._SNOOZE_COUNT = 3; // max amount of consecutive snoozes.
        this._SNOOZETIME_MS = 30*1000; // TODO: move to settings
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
        if(this[defer]) {
            if (verbose) console.log(`AlarmRunner.${defer}.resolve()`);
            this[defer].resolve();
            this[defer] = null;
        } else {
            if (verbose) console.log(`AlarmRunner.${defer}() called but its deferred is null?`);
        }
    }

    async waitForStop() {
        await this._stopDeferred.promise;
        return this._STATUS_STOP;
    }

    async waitForSnooze() {
        await this._snoozeDeferred.promise;
        return this._STATUS_SNOOZE;
    }

    async waitForTimeout() {
        await this._timeoutDeferred.promise;
        return this._STATUS_TIMEOUT;
    }

    // _must_ be reset before reassigning stopResolved to prevent memory leaks!
    createDeferredPromises() {
        this._snoozeDeferred = new utils.Deferred();
        this._stopDeferred = new utils.Deferred();
        this._timeoutDeferred = new utils.Deferred((resolve, reject) => {
            utils.sleep(10000).then(resolve);
        });
    }

    resetDeferredPromises() {
        this.stop(false);
        this.snooze(false);
        this.timeout(false);
    }

    async run() {
        console.log(`Started running an alarm at: ${new Date()}`);

        let snoozeNextIteration = false;
        let snoozesLeft = this._SNOOZE_COUNT;

        for(let restartsLeft = this._RESTART_COUNT; restartsLeft > 0; ) {
            if (this._settings.verbose) {
                if(!snoozeNextIteration) {
                    console.log("+++++++++++++++++++");
                }  else {
                    console.log("~~~~~~~~~~~~~~~~~~~");
                }
            }
            if(!snoozeNextIteration) {
                console.log("AlarmRunner.run emit: alarmpi-start.");
                this._events.emit('alarmpi-start', this._alarmConf);
                snoozesLeft = this._SNOOZE_COUNT;
                restartsLeft--;
            }
            this.createDeferredPromises();

            let promislist= [];

            promislist.push(this.waitForStop());
            promislist.push(this.waitForTimeout());
            if (restartsLeft <= 0) {
                console.log("No snoozing allowed on last alarm!");
            } else if (snoozesLeft <= 0){
                console.log("No snoozing allowed anymore!");
            } else {
                promislist.push(this.waitForSnooze());
            }

            await Promise.race(promislist).then((status) => {
                this.resetDeferredPromises();
                console.log(`AlarmRunner.run() received event <<${status}>>`);

                switch(status) {
                    case this._STATUS_TIMEOUT:
                        snoozeNextIteration = !snoozeNextIteration;
                        break;
                    case this._STATUS_SNOOZE:
                        snoozeNextIteration = true;
                        snoozesLeft--;
                        break;
                    case this._STATUS_STOP:
                        restartsLeft = 0;
                        break;
                }
            });

            console.log("AlarmRunner.run emit: alarmpi-stop.");
            this._events.emit('alarmpi-stop', this._alarmConf);

            console.log(`Restarts left: ${restartsLeft}. Snoozes left: ${snoozesLeft}.`);
        }

        if (this._settings.verbose) {
            console.log("AlarmRunner.run() done");
        }
    }

}
