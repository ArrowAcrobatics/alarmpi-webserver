import fs from "node:fs/promises";

export class AlarmStorage {
    constructor(settings, appEvents) {
        this._settings = settings;
        this._events = appEvents;
    }

    // TODO: add event emitter for changes.

    /**
     * Reads alarm json from disk.
     */
    async getAlarms() {
        try {
            const data = await fs.readFile(this._settings.alarmFileRead, {encoding: 'utf8'});
            const contents = JSON.parse(data);
            return contents;
        } catch (err) {
            console.error(err.message);
        }

        return {};
    }

    /**
     * Writes alarm json to disk.
     */
    async setAlarms(alarmsJson) {
        let jsonstr = JSON.stringify(alarmsJson, undefined, 4);
        // console.log(jsonstr);
        await fs.writeFile(this._settings.alarmFileWrite, jsonstr)
            .then(async () =>
                await fs.rename(this._settings.alarmFileWrite, this._settings.alarmFileRead));

        if (this._settings.verbose) {
            console.log(this._settings.alarmFileRead + " updated");
        }
    }
}