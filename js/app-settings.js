export class AppSettings {
    constructor(rootDir) {
        this.rootDir = rootDir;
        this.alarmFileRead = 'alarms/alarms.json';
        this.alarmFileWrite = 'alarms/alarms-pending-update.json';
        this.alarmSoundFolder = rootDir + "/sounds";
    }
}