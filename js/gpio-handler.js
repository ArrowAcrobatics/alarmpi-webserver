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
        this._buttonRed = new Button("R", 17, this);
        this._buttonBlack = new Button("B", 27, this);
        this._buttonYellow = new Button("Y", 22, this);
        this._buttonI = new Button("1", 24, this);
        this._buttonII = new Button("2", 25, this);

        this._clickQ = [];
    }

    init() {
        this.buttons().forEach((button) => button.init());
    }

    onButtonPress(button, value) {
        this._clickQ.push(button._name + (value? 1 : 0));

        while(this._clickQ.length > 3) {
            this._clickQ.shift();
        }
        
        console.log(`button ${button._name} callback called: ${value}. Queue: ${this._clickQ.join(" ")}`);
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