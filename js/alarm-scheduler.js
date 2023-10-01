import * as cron from 'node-cron';
import * as alarmRunner from './alarm-runner.js';
import * as utils from './utils.js';

export class AlarmScheduler {
    /**
     * Create a new instance of the scheduler.
     */
    constructor(settings, appEvents) {
        this._settings = settings;
        this._events = appEvents;
        this._alarmsjobs = [];
        this._activeRunners = [];

        this._events.on('action_stop', () => this.stop());
        this._events.on('action_snooze', () => this.snooze());
    }

    /**
     * Stop and remove all cron jobs and bring this instance into default state.
     */
    reset() {
        console.log("resetting alarm scheduler");
        this._alarmsjobs.forEach((job) => job.stop());
        this._alarmsjobs = [];
        this._activeRunners = [];
    }

    snooze() {
        console.log("AlarmScheduler.snooze() called");
        this._activeRunners.forEach((runner) => {
           runner.snooze();
        });
    }

    stop() {
        console.log("AlarmScheduler.stop() called");
        // this.reset();
        this._activeRunners.forEach((runner) => {
           runner.stop();
        });
    }

    load(alarmListJson){
        // clear old state
        this.reset();

        alarmListJson.alarms.forEach(
            (alarmJson) => {
                let cronstr = this.getCronStr(alarmJson);
                console.log(`Adding alarm with cronstr: ${cronstr} (${cron.validate(cronstr)})`);

                // append new cron job
                this._alarmsjobs.push(cron.schedule(
                    cronstr,
                    () => new Promise(async (resolve, reject) => {
                        // scheduler invoked every time, but runner will only be executed when active
                        if(!alarmJson.settings.active) {
                            console.log("Scheduler called: alarm not active.");
                            return resolve();
                        }
                        console.log("--------------");
                        console.log("Scheduler called: creating alarm runner.");
                        // this func is called on the specified times
                        let runner = new alarmRunner.AlarmRunner(this._settings, this._events, alarmJson);

                        this._activeRunners.push(runner);

                        await runner.run()
                            .catch((e) => {
                                console.log(`alarm had an exception: ${e}`);
                            }).finally(() => {
                                console.log("alarm done, removing from active list");
                                utils.RemoveFromArray(this._activeRunners,runner);
                        });

                        return resolve();
                    })
                ));
            }
        );
    }

    getCronStr(alarmJson) {
        let t = alarmJson.settings.time.split(":");
        let h = t[0].replace(/^0+/, '') || '0';
        let m = t[1].replace(/^0+/, '') || '0';

        const capitalize = (s) => (s[0].toUpperCase() + s.slice(1));
        let activedaysstring = obj => Object.entries(obj).map(([k, v]) => {
            return v ? capitalize(k) : "";
        }).filter((dayname) => dayname != "").join(',');
        let d = activedaysstring(alarmJson.days);

        return `0 ${m} ${h} * * ${d}`;
    }
}