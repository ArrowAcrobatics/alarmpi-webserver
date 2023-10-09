export class AppSettings {
    // TODO: add file-watcher/event-emitter for changes from disk?

    constructor(rootDir) {
        this.verbose = true;
        this.rootDir = rootDir;
        this.alarmFileRead = 'alarms/alarms.json';
        this.alarmFileWrite = 'alarms/alarms-pending-update.json';
        this.alarmSoundFolder = rootDir + "/sounds";
        this.uiSoundLongBlip = this.alarmSoundFolder + "/ui-long-blip";
        this.uiSoundShortBlip = this.alarmSoundFolder + "/ui-short-blip";

        this.snoozeTimeMs = 30*1000;
        this.snoozeCount = 3; // max amount of consecutive accepted snoozes.
        this.ringCount = 4; // max amount of consecutive rings.
    }
}