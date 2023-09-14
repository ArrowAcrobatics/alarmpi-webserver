import fs from "node:fs/promises";

export class AlarmStorage {
    constructor(settings) {
        this._settings = settings;
    }

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

    async setAlarms(alarmsJson) {
        let jsonstr = JSON.stringify(alarmsJson, undefined, 4);
        // console.log(jsonstr);
        await fs.writeFile(this._settings.alarmFileWrite, jsonstr)
            .then(async () =>
                await fs.rename(this._settings.alarmFileWrite, this._settings.alarmFileRead));
        console.log(this._settings.alarmFileRead + " updated");
    }
}