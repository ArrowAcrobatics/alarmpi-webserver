import {Button} from "./button.js";
import {Gpio} from 'onoff';

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
        this._buttonRed = new Button("red", 17, this);
        this._buttonBlack = new Button("black", 27, this);
        this._buttonYellow = new Button("yellow", 22, this);
        this._buttonI = new Button("I", 24, this);
        this._buttonII = new Button("II", 25, this);
    }

    init() {
        this.buttons().forEach((button) => button.init());
    }

    onButtonPress(button, value) {
        console.log(`button ${button._name} callback called: ${value}`);
    }

    async execBackendCommand(gpioJson) {
        console.log(`GpioHandler.execBackendCommand: "${gpioJson}"`);

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

    buttons() {
        return [
            this._buttonRed,
            this._buttonBlack,
            this._buttonYellow,
            this._buttonI,
            this._buttonII
        ]
    }
}