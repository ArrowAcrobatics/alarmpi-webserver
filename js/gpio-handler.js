/**
 * Responsible for reading gpio pins, receiving client side (emulated) button presses
 * and dispatching relevant events:
 *
 * Ideas:
 * - snooze
 * - stop
 * - volume up/down
 * - next/prev track
 * - get-time
 * - get-info
 */
export class GpioHandler {
    constructor(settings, appEvents) {
        this._settings = settings;
        this._events = appEvents;
    }

    async execBackendCommand(gpioJson) {
        console.log(`gpio cmd "${gpioJson.cmd}" not implemented`);

        switch(gpioJson.cmd) {
            case "red":
                this._events.emit('stop');
                break;
            case "black":
                // this._events.emit('foo');
                break;
            case "yellow":
                this._events.emit('snooze');
                break;
            default:
                console.log(`gpio cmd "${gpioJson.cmd}" not implemented`);
        }
    }
}