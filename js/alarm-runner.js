/**
 * Responsible for a single alarm instance/moment.
 * Deals with the button UI and operates the VLC bridge.
 */
export class AlarmRunner {
    constructor(alarmSettingsJson, vlcBridge, settings) {
        // TODO: add scheduler ref for querying current run status.
        this._settings = settings;
        this._alarmConf = alarmSettingsJson;
        this._vlcBridge = vlcBridge;
    }

    async run() {
        if(this._settings.verbose) {
            console.log("Running an alarm at " + new Date());
            console.log(this._alarmConf);
        }

        return new Promise(async (resolve, reject) => {
            // let timeoutP = sleep(maxAlarmTime).then(() => {this.stop; resolve();}));
            // buttonUI.on('stopButton', () => {this.stop; resolve();}));
            // buttonUI.on('snoozeButton' () => { this.snooze();});
            await utils.sleep(1000);
            if (this._settings.verbose) {
                console.log("alarm done");
            }
            resolve();
        });
    }

    stop() {
        // for other alarms to go solo.
    }
};