import {serverUrl} from "./utils.js";

export function InitUI() {
    $(document).on('click','.alarmpi-gpio-ui', function(evt) {
        PostGpioCommand($(evt.target).attr('id'));
    });
}
function GpioPostUrl() {
    return serverUrl() + "/gpio";
}
function PostGpioCommand(cmdname) {
    cmdname = cmdname.split('-')[1];
    // split off 'gpio-' from html id.
    console.log("clicked: " + cmdname);

    let cmdjson = {
        "cmd" : cmdname,
        "params": {}
    };

    fetch( GpioPostUrl(), {
        method: 'POST',
        headers: {
              'Content-Type' : 'application/json'
        },
        body: JSON.stringify(cmdjson)
        }
    )
        .then(res => console.log(res.json()))
        .catch(err => console.log("post err:" + err));
}
