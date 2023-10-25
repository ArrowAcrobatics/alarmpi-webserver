import fs from "node:fs/promises";

export class Storage {
    constructor(settings, appEvents) {
        this._settings = settings;
        this._events = appEvents;
    }

    // TODO: add event emitter for changes.

    /**
     * Reads alarm json from disk.
     */
    async getAlarms() {
        return this.getData(this._settings.alarmFileRead);
    }

    /**
     * Writes alarm json to disk.
     */
    async setAlarms(alarmsJson) {
        return this.setData(
            alarmsJson,
            this._settings.alarmFileRead,
            this._settings.alarmFileWrite);
    }

    /**
     * Reads settings json from disk.
     */
    async getSettings() {
        return this.getData(this._settings.settingsFileRead);
    }

    /**
     * Writes settings json to disk.
     */
    async setSettings(settingsJson) {
        return this.setData(
            settingsJson,
            this._settings.settingsFileRead,
            this._settings.settingsFileWrite);
    }

    /**
     * Reads json file from disk.
     */
    async getData(filepath) {
        try {
            const data = await fs.readFile(filepath, {encoding: 'utf8'});
            const contents = JSON.parse(data);
            return contents;
        } catch (err) {
            console.error(err.message);
        }

        return {};
    }

    async setData(dataobject, filepath, tempfilepath) {
        let jsonstr = JSON.stringify(dataobject, undefined, 4);

        await fs.writeFile(tempfilepath, jsonstr)
            .then(async () =>
                await fs.rename(tempfilepath, filepath));

        if (this._settings.verbose) {
            console.log(filepath + " updated");
        }
    }
}