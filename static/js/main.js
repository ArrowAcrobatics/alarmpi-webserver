import * as alarmpi from './alarmpi-frontend.js';
import * as vlc from './vlc-frontend.js';
import * as sortable from './sortable-frontend.js';
import * as gpio from './gpio-frontend.js';

import {serverUrl} from "./utils.js";
import {AddAlarm} from "./alarmpi-frontend.js";

$(document).ready(function(){
    console.log("Initializing front-end for:" + serverUrl());

    sortable.InitUI();
    alarmpi.InitUI();
    vlc.InitUI();
    gpio.InitUI();

    $(document).on('click','.alarmpi-debug',  function(evt) {
        console.log("toggle debug ui");
        $(evt.target).each(toggleDebugUi)
    });
});

function toggleDebugUi () {
    $(".debug-ui").fadeToggle();
}