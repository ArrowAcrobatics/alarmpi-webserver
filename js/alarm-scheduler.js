import * as cron from 'node-cron';
import * as alarmRunner from './alarm-runner.js';
import * as utils from './utils.js';

export class AlarmScheduler {
    /**
     * Create a new instance of the scheduler.
     *
     * @param {boolean=false} verbose - Tell if the VLC error stream should be relayed to the current process error stream.
     */
    constructor(vlcBridge, settings) {
        this._settings = settings;
        this._vlc = vlcBridge;
        this._alarmsjobs = [];
        this._activeRunners = [];
    }

    reset() {
        this._alarmsjobs.forEach((job) => job.stop());
        this._alarmsjobs = [];
        this._activeRunners = [];
    }

    load(alarmListJson){
        // clear old garbage
        this.reset();

        alarmListJson.alarms.forEach(
            (alarmJson) => {
                let cronstr = this.getCronStr(alarmJson);
                return;
                // append new cron job
                this._alarmsjobs.append(cron.schedule(
                    cronstr,
                    async () => {
                        // this func is called on the specified times
                        let runner = new alarmRunner.AlarmRunner(alarmJson, this._vlc, this._settings)

                        this._activeRunners.append(runner);

                        await runner.run()
                            .catch(() => {
                                console.log("alarm had an exception.");
                            }).finally(() => {
                                console.log("alarm done, removing from active list");
                                utils.RemoveFromArray(this._activeRunners,runner);
                        });
                    }
                ));
            }
        );
    }

    getCronStr(alarmJson) {
        let t = alarmJson.settings.time.split(":");
        let h = t[0];
        let m = t[1];

        let activedaysstring = obj => Object.entries(obj).map(([k, v]) => {
            return v ? k : "";
        }).filter((dayname) => dayname != "").join(',');
        let d = activedaysstring(alarmJson.days);

        return `${m} ${h} * * ${d}`;
    }
}