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
    constructor(settings, appBackendEventEmitter) {

    }

    async execBackendCommand(gpioJson) {
        console.log(`gpio cmd "${gpioJson.cmd}" not implemented`);
    }
}