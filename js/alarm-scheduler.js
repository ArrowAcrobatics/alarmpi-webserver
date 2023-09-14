import * as cron from 'node-cron';
import * as alarmRunner from './alarm-runner.js';
import * as utils from './utils.js';

export class AlarmScheduler {
    /**
     * Create a new instance of the scheduler.
     *
     * @param {boolean=false} verbose - Tell if the VLC error stream should be relayed to the current process error stream.
     */
    constructor(vlcBridge, verbose = false) {
        this._verbose = verbose;
        this._vlc = vlcBridge;
        this._alarmsjobs = [];
        this._activeRunners = [];
    }

    reset() {
        this._alarmsjobs.each((job) => {
            job.stop();
        });
        this._alarmsjobs = [];
        this._activeRunners = [];
    }

    load(alarmListJson){
        // clear old garbage
        this.reset();

        alarmListJson.alarms.each(
            (alarmJson) => {
                // append new cron job
                this._alarmsjobs.append(cron.schedule(
                    this.getCronStr(alarmJson),
                    async () => {
                        // this func is called on the specified times
                        let runner = new alarmRunner.AlarmRunner(alarmJson, this._vlc, this._verbose)

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
        // TODO: extract the info from the alarm and format the string accordingly.
        return "* * * * *";
    }
};