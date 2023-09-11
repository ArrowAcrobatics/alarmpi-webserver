import * as app from './app-frontend.js'
import {AddAlarm} from "./app-frontend.js";

function InitReorderableDiv() {
    $( "#sortable" ).sortable();
    $('#sortable').on("sortupdate", function( event, ui ) {
        console.log("sorting updated");
        // TODO: update values of index fields.
        // TODO: send post request
        app.postAlarms();
    });
}

function InitUI() {
    $(document).on('click','.alarmpi-delete', function(evt) {
        $(evt.target).each(app.DeleteAlarm);
    } );

    $(document).on('click','.alarmpi-add', function(evt) {
       $(evt.target).each(app.AddAlarm);
    });

    $(document).on('input change', 'input',function(evt){
         $(evt.target).each(app.OnInputUpdate);
    });
}

$(document).ready(function(){
    console.log("Initializing front-end for:" + app.serverUrl());
    InitReorderableDiv();
    InitUI();
});