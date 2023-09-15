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
            // TODO: while(restartCounter > 0)
            let timedOutToken = {isTimedOut: false};

            await Promise.race([
                this.stopPromise(timedOutToken),
                this.snoozePromise(timedOutToken),
                this.timeoutPromise(timedOutToken)
            ]);

            if (this._settings.verbose) {
                console.log("alarm done");
            }
            this.stop();
            resolve();
        });
    }

    timeoutPromise(timedOutToken) {
        return new Promise(async (resolve, reject) => {
            await utils.sleep(5000);

            if(timedOutToken.isTimedOut) {
                console.log("alarm timed out");
            }
            timedOutToken.isTimedOut = true;

            // do actual handling:
            // remove event handlers.

            return resolve();
        });
    }

    stopPromise(timedOutToken) {
        return new Promise(async (resolve, reject) => {
            this._events.on('stop', () => {
               if(timedOutToken.isTimedOut) {
                  return resolve();
               }
               timedOutToken.isTimedOut = true;

               // do actual handling
                console.log("alarm stopped using button");
                return resolve();
            });
        });
    }

    snoozePromise(timedOutToken) {
        return new Promise(async (resolve, reject) => {
            this._events.on('snooze', () => {
               if(timedOutToken.isTimedOut) {
                  return resolve();
               }
               timedOutToken.isTimedOut = true;

               // do actual handling
                console.log("alarm snoozed using button");
                return resolve();
            });
        });
    }

    stop() {
        // for other alarms to go solo etc.
        this._events.emit('alarmpi-stop', this._alarmConf);
    }

    snooze() {
        console.log("snoozed");
    }
};