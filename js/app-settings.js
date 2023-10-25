export class AppSettings {
    constructor(rootDir) {
        this.verbose = true;
        this.rootDir = rootDir;
        this.alarmFileRead = 'alarms/alarms.json';
        this.alarmFileWrite = 'alarms/alarms-pending-update.json';

        this.settingsFileRead = 'alarms/settings.json';
        this.settingsFileWrite = 'alarms/settings-pending-update.json';

        this.alarmSoundFolder = rootDir + "/sounds";
        this.uiSoundFolder = rootDir + "/sounds-ui";

        this.uiSoundLongBlip = this.uiSoundFolder + "/ui-long-blip.mp3";
        this.uiSoundShortBlip = this.uiSoundFolder + "/ui-short-blip.mp3";

        this.snoozeTimeMs = 30*1000;
        this.ringTimeMs = 10*1000;
        this.snoozeCount = 3; // max amount of consecutive accepted snoozes.
        this.ringCount = 4; // max amount of consecutive rings.

        // volume
    }
}