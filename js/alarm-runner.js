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
        let snoozeCounter = this._SNOOZE_COUNT;

        for(let restartCounter = this._RESTART_COUNT; restartCounter> 0; ) {
            if (this._settings.verbose) {
                console.log(`Restarts left: ${this._RESTART_COUNT}. Snoozes left: ${snoozeCounter}.`);
                // console.log(this._alarmConf);
            }

            if(!snoozeNextIteration) {
                this._events.emit('alarmpi-start', this._alarmConf);
                snoozeCounter = this._SNOOZE_COUNT;
                restartCounter--;
            }

            this.createDeferredPromises();
            await Promise.race([
                this.waitForStop(),
                this.waitForSnooze(),
                this.waitForTimeout()
            ]).then((status) => {
                this.resetDeferredPromises();
                console.log(`AlarmRunner.run() loop status <<${status}>>`);

                switch(status) {
                    case this._STATUS_TIMEOUT:
                        snoozeNextIteration = !snoozeNextIteration;
                        break;
                    case this._STATUS_SNOOZE:
                        if (snoozeCounter > 0) {
                            snoozeNextIteration = true;
                            // TODO: fire alarm snoozed one-shot?
                        } else {
                            snoozeNextIteration = false;
                            console.log("Too many snoozes, deal with it.");
                            // TODO: fire alarm not snoozed one-shot?
                        }

                        snoozeCounter--;
                        break;
                    case this._STATUS_STOP:
                        restartCounter = 0;
                        break;
                }
            });

            // extra stop event won't hurt. It's more clear at end of loop than in the then().
            this._events.emit('alarmpi-stop', this._alarmConf);

        }

        if (this._settings.verbose) {
            console.log("AlarmRunner.run() done");
        }
    }

}
