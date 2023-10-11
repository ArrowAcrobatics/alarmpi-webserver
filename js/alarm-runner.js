import * as utils from "./utils.js";

/**
 * Responsible for a single alarm instance/moment.
 * Exposes button UI callbacks (snooze, stop, timeout) and emits alarmpi-* events.
 */
export class AlarmRunner {
    constructor(settings, appEvents, alarmSettingsJson) {
        // TODO: add scheduler ref for querying current run status.
        this._settings = settings;
        this._alarmConf = alarmSettingsJson;
        this._events = appEvents;

        // deferred promises, resolved by calling this.snooze(), .stop(),
        // and .timeout() or after snoozeTimeMs respectively.
        this._snoozeDeferred = null;
        this._stopDeferred = null;
        this._timeoutDeferred = null;

        // return values for the promises.
        this._STATUS_STOP = "stop";
        this._STATUS_SNOOZE = "snooze";
        this._STATUS_TIMEOUT = "timeout";
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
            // might get here when snooze button is pressed and no longer allowed.
            if (verbose) console.log(`AlarmRunner.${defer}() called but its deferred is null.`);
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
    createDeferredPromises(timeout) {
        this._snoozeDeferred = new utils.Deferred();
        this._stopDeferred = new utils.Deferred();
        this._timeoutDeferred = new utils.Deferred((resolve, reject) => {
            utils.sleep(timeout).then(resolve);
        });
    }

    resetDeferredPromises() {
        this.stop(false);
        this.snooze(false);
        this.timeout(false);
    }

    async run() {
        console.log(`Started running an alarm at: ${new Date()}`);

        // Reload needs to finish before alarmpi-start is emitted, so we await a deferred.
        // Assumes only one, well-behaved, event listener.
        let reloadDoneDeferred = new utils.Deferred();
        this._events.emit('alarmpi-reload', reloadDoneDeferred);
        await reloadDoneDeferred.promise;

        console.log("AlarmRunner.run: reload done.");

        let snoozeNextIteration = false;
        let snoozesLeft = this._settings.snoozeCount;

        for(let restartsLeft = this._settings.ringCount; restartsLeft > 0; ) {
            let timeout;

            if(!snoozeNextIteration) {
                if (this._settings.verbose) console.log("+++++++++++++++++++");

                console.log("AlarmRunner.run emit: alarmpi-start.");
                this._events.emit('alarmpi-start', this._alarmConf);

                timeout = this._settings.ringTimeMs;
                snoozesLeft = this._settings.snoozeCount;
                restartsLeft--;
            } else {
                if (this._settings.verbose) console.log("~~~~~~~~~~~~~~~~~~~");
                timeout = this._settings.snoozeTimeMs;
            }

            // determine and set up the events to wait for (stop/snooze/timeout).
            let promises= [];
            this.createDeferredPromises(timeout);
            promises.push(this.waitForStop());
            promises.push(this.waitForTimeout());
            if (restartsLeft <= 0) {
                console.log("No snoozing allowed on last alarm!");
            } else if (snoozesLeft <= 0){
                console.log("No snoozing allowed anymore!");
            } else {
                promises.push(this.waitForSnooze());
            }

            await Promise.race(promises).then((status) => {
                this.resetDeferredPromises();
                console.log(`AlarmRunner.run() received event <<${status}>>`);

                switch (status) {
                    case this._STATUS_TIMEOUT:
                        snoozeNextIteration = !snoozeNextIteration;
                        break;
                    case this._STATUS_SNOOZE:
                        snoozeNextIteration = true;
                        snoozesLeft--;
                        this._events.emit('ui_short_blip');
                        break;
                    case this._STATUS_STOP:
                        restartsLeft = 0;
                        this._events.emit('ui_long_blip');
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
