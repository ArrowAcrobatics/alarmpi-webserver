import {Button} from "./button.js";
import {Gpio} from 'onoff';

/**
 * Responsible for reading gpio pins, receiving client side (emulated) button presses
 * and dispatching relevant events:
 *
 * Events:
 * - action_snooze
 * - action_stop
 * - action_down
 * - action_up
 * - action_special
 * - mode_1
 * - mode_2
 *
 * Ideas:
 * - volume up/down
 * - next/prev track
 * - get-time
 * - get-info
 */
export class GpioHandler {
    constructor(settings, appEvents) {
        this._settings = settings; // TODO: pin inversion and delay etc in settings?
        this._events = appEvents;
        this._buttonRed = new Button("R", 17, this);
        this._buttonBlack = new Button("B", 27, this);
        this._buttonYellow = new Button("Y", 22, this);
        this._buttonI = new Button("1", 24, this);
        this._buttonII = new Button("2", 25, this);

        this._shift = false;
        this._shiftHandled = false;
        this._shiftEmulatorTimeoutMs = 2000;
    }

    init() {
        this.buttons().forEach((button) => button.init());
    }

    getMode() {
        console.log("TODO: implement GpioHandler.getMode");
    }

    onButtonPress(button, value) {
        console.log(`GpioHandler.onButtonPress ${button._name}: ${value}.`);

        switch(button._name) {
            case "B": {
                this._shift = value ? true: false;

                if (!value && !this._shiftHandled) {
                    // emit on up only, if not handled
                    this.doEmit("action_special");
                }

                this._shiftHandled = false;

                break;
            }
            case "R" : {
                if (value) {
                    this._shiftHandled = true;
                    // emit on down only
                    this.doEmit(this._shift ? 'action_down' : 'action_stop');
                }
                break;
            }
            case "Y" : {
                if (value) {
                    this._shiftHandled = true;
                    // emit on down only
                    this.doEmit(this._shift ? 'action_up' : 'action_snooze');
                }
                break;
            }
            case "1" : {
                this.doEmit(value ? 'mode_1' : 'mode_0');
                break;
            }
            case "2" : {
                this.doEmit(value ? 'mode_2' : 'mode_0');
                break;
            }
        }
    }

    doEmit(actionname) {
        console.log(`GpioHandler.doEmit: ${actionname}`);
        this._events.emit(actionname);
    }

    /**
     * Handle front end request. (Emulated button press.)
     * @param gpioJson
     * @returns {Promise<void>}
     */
    async execBackendCommand(gpioJson) {
        console.log(`GpioHandler.execBackendCommand: "${gpioJson}"`);

        switch(gpioJson.cmd) {
            case "red":
                this._events.emit('action_stop');
                break;
            case "black":
                this._shift = true;
                setTimeout(() => {
                    console.log("Emulated shift turned off.");
                    this._shift = false;
                }, this._shiftEmulatorTimeoutMs);
                break;
            case "yellow":
                this._events.emit('action_snooze');
                break;
            default:
                console.log(`gpio cmd "${gpioJson.cmd}" not implemented`);
        }
    }

    // util for looping over the buttons.
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