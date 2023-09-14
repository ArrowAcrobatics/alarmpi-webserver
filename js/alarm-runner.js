/**
 * Responsible for a single alarm instance/moment.
 * Deals with the button UI and operates the VLC bridge.
 */
export class AlarmRunner {
    constructor(alarmSettingsJson, vlcBridge, verbose) {
        // TODO: add scheduler ref for querying current run status.
        this._settings = alarmSettingsJson;
        this._vlcBridge = vlcBridge;
        this._verbose = verbose;
    }

    async run() {
        if(this._verbose) {
            console.log("Running an alarm at " + new Date());
        }
    }

    stop() {
        // for other alarms to go solo.
    }
};