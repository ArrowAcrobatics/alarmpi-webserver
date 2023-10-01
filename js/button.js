import {Gpio} from 'onoff';
import {exec} from "child_process";

export class Button {
    constructor(eventname, gpiopin, gpiohandler) {
        this._name = eventname;
        this._pin = gpiopin;
        this._handler = gpiohandler;
        this._sigkillHandlerCalled = false;
        this._gpio = new Gpio(gpiopin, 'in', 'both', {debounceTimeout: 20, activeLow: true});
    }

    init() {
        if(!Gpio.accessible) {
            console.log("No GPIO accessible");
            return;
        }

        let pullup_cmd = `raspi-gpio set ${gpiopin} ip pu`;
        console.log(`Init button "${this._name}": ` + pullup_cmd);
        exec(pullup_cmd);

        this._gpio.watch(this.onPress());

        process.on('SIGINT', this.onSigKill());
    }

    /**
     * Returns a callback function that can be used to watch this button.
     * Forwards the call to this._handler.
     *
     * @returns {(function(*, *): void)|*}
     */
    onPress() {
        return (err, value) => {
            if (err) {
                console.log(`error watching: ${err}`);
                throw err;
            }

            this._handler.onButtonPress(this, value);
        };
    }

    /**
     * Returns a callback function that handles graceful exit on sigkill.
     * @returns {(function(*, *): void)|*}
     */
    onSigKill() {
        return _=> {
            if(this._sigkillHandlerCalled) {
                console.log("Multiple calls to sigcill. Ignoring.");
                return;
            }
            this._sigkillHandlerCalled = true;
            try {
                console.log("TODO: this is sigkill handler hangs the system if enabled.");
                // this._gpio.unexport();
            } catch (e) {
                console.log(`Error deregistering button ${this._name} at pin ${this._pin}; ${e}`);
            }
        }
    }
}