import { spawn } from "node:child_process";
import fs from "node:fs";

/**
 * A wrapper over the remote control interface of VLC.
 */
export class VlcBridge {

    /**
     * Create a new instance of the player.
     *
     * @param {boolean=false} verbose - Tell if the VLC error stream should be relayed to the current process error stream.
     */
    constructor() {
        this._playlist = new Map();
        this._playlistIndex = 3;
        this._vlc = null;

        this._isShuffled = false;
        this._isPlaying = false;
    }

    async execBackendCommand(vlcJson) {
        console.log(`VlcBridge.execBackendCommand: "${vlcJson}"`);
        // TODO: propagate possible failure to execute
        switch (vlcJson.cmd) {
            case "open":
                await this.open();
                break;
            case "close":
                await this.close();
                break;
            case "play":
                await this.play();
                break;
            case "pause":
                await this.pause();
                break;
            case "stop":
                await this.stop();
            case "togglePlay":
                await this.setPlayPause(!this._isPlaying);
                break;
            case "toggleShuffle":
                await this.setShuffle(!this._isShuffled);
                break;
            default:
                console.log(`vlc cmd "${vlcJson.cmd}" not implemented`);
        }
    }

    /**
     * Open the VLC media player with an empty playlist. VLC will not take
     * over the display until the first media is added to the playlist.
     */
    async open() {
        return new Promise((resolve, reject) => {
            let options = [
                "-f",
                "--quiet",
                "--no-playlist-autostart",
                "--no-video-title-show",
                "-I", "rc"
            ];

            this._vlc = spawn("cvlc", options);

            this._vlc.on('spawn', () => {
                console.info(`VLC spawn success.`);

                this._vlc.stderr.on("data", data => process.stderr.write(data));

                return resolve();
            });

            this._vlc.on('error', (data) => {
               this._vlc = null;
               return reject(data);
            });
        });
    }

    /**
     * Start playing after being paused or enqueue the given file at the end
     * of the playlist. If the file is already in the playlist, jump to that
     * media position in the playlist instead.
     *
     * @param {string=} mediaPath - If unspecified, resumes the running video. If a valid media path is specified, start playing that media.
     */
    async play(mediaPath) {
        if (!mediaPath) {
            await this.exec("play");
        }
        else {
            if (!this._playlist.has(mediaPath)) {
                await this.add(mediaPath);
            }
            let index = this._playlist.get(mediaPath);
            await this.exec(`goto ${index}`);
        }
        this._isPlaying = true;
    }

    /**
     * Pause the current media.
     */
    async pause() {
        await this.exec("pause");
        this._isPlaying = false;
    }

    async next() {
        await this.exec("next");
    }

    async volup() {
        await this.exec("volup");
    }

    async voldown() {
        await this.exec("voldown");
    }

    async setPlayPause(value) {
        if(value) {
            await this.play();
        } else {
            await this.pause();
        }
    }

    /**
     * Add the specified media at the end of the playlist.
     *
     * @param {string} mediaPath The path of the media to play.
     */
    async add(mediaPath) {
        if (!fs.existsSync(mediaPath)) {
            throw new Error(`Media '${mediaPath}' not found.`);
        }
        if (this._playlist.has(mediaPath)) {
            throw new Error(`Media '${mediaPath}' already in the playlist.`);
        }
        this._playlist.set(mediaPath, this._playlistIndex);
        this._playlistIndex++;
        await this.exec(`enqueue ${mediaPath}`);
    }

    /**
     * Turns the repeat mode on or off. Loop over the current media until turned off.
     *
     * @param {string|boolean} [value=true] - Set the repeat mode on or off. Accepts true, false, 'on', 'off'.
     */
    async repeat(value = true) {
        let mode = _onoff(value);
        await this.exec(`repeat ${mode}`);
    }

    /**
     * Turns the loop mode on or off. Loop over the whole playlist in order.
     *
     * @param {string|boolean} [value=true] - Set the loop mode on or off. Accepts true, false, 'on', 'off'.
     */
    async loop(value = true) {
        let mode = _onoff(value);
        await this.exec(`loop ${mode}`);
    }

    async setShuffle(value = true) {
        let mode = _onoff(value);
        await this.exec(`random ${mode}`);
        this._isShuffled = value;
    }

    async stop() {
        await this.exec("stop");
    }

    /**
     * Terminate the VLC process.
     */
    async close() {
        await this.exec("quit");
        this._vlc = null;
    }

    /**
     * Execute any command that the rc (lua) console interface can accept.
     *
     * @param {string} command - The command to execute.
     */
    exec(command) {
        return new Promise((resolve, reject) => {
            if (!command) {
                return reject("The command parameter must be provided.");
            }
            if(!this._vlc) {
                return reject("VLC is not available");
            }
            console.log(`VlcBridge.exec: ${command}`)
            this._vlc.stdin.write(`${command}\n`, err => {
                if (err) reject(err);
                return resolve();
            });
        });
    }


}

function _onoff(value) {
    if ((value || value === undefined) && value !== "off") {
        return "on";
    }
    return "off";
}