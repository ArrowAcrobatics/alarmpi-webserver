import * as alarmpi from './alarmpi-frontend.js';
import * as vlc from './vlc-frontend.js';
import * as sortable from './sortable-frontend.js';
import {serverUrl} from "./utils.js";

$(document).ready(function(){
    console.log("Initializing front-end for:" + serverUrl());
    sortable.InitUI();
    alarmpi.InitUI();
    vlc.InitUI();
});