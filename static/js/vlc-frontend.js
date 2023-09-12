import {AddAlarm, DeleteAlarm, OnInputUpdate} from "./alarmpi-frontend.js";
import {serverUrl} from "./utils.js";



export function InitUI() {
    $(document).on('click','.alarmpi-vlc-ui', function(evt) {
       // $(evt.target).each();
        PostVlcCommand($(evt.target).attr('id'));
    });
}
function VlcPostUrl() {
    return serverUrl() + "/vlc";
}
function PostVlcCommand(cmdname) {
    cmdname = cmdname.split('-')[1];
    // split off 'vlc-' from html id.
    console.log("clicked: " + cmdname);

    let cmdjson = {
        "cmd" : cmdname,
        "params": {}
    };

    fetch( VlcPostUrl(), {
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
