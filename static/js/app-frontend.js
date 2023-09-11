import * as alarmWidget from "./gen/alarm-client.js";
//import { bootstrapToggle } from "https://cdn.jsdelivr.net/npm/bootstrap5-toggle@5.0.4/js/bootstrap5-toggle.ecmas.min.js";

/**
 * Returns URI to the server e.g. localhost:3000
  */
export function serverUrl() {
    return "http://" + window.location.hostname + ":" + window.location.port;
}


/**
 * post alarms json to the server
 */
export function postAlarms() {
    fetch( serverUrl(), {
        method: 'POST',
        headers: {
              'Content-Type' : 'application/json'
        },
        body: JSON.stringify(alarmpiJsonAll())
        }
    )
        .then(res => console.log(res.json()))
        .catch(err => console.log("post err:" + err));
}

export function OnInputUpdate() {
    let name = getInputValueJq($(this).closest('.alarmpi').find("#hidden").find("#name"));
    console.log("Alarmpi " + name + " update called");
}

export function DeleteAlarm() {
    let alarmpi =$(this).closest('.alarmpi');

    console.log("Delete button clicked for alarm:");
    console.log(alarmpiJsonSingle(alarmpi));
    alarmpi.remove();
}

export function AddAlarm() {
    console.log("add alarm button");

    let defaultalarm = JSON.parse(`{
            "hidden": {
                "guid": "peepee",
                "index": -1,
                "name": "alarmpi"
            },
            "settings": {
                "active": true,
                "time": "13:00"
            },
            "days": {
                "monday": true,
                "tuesday": true,
                "wednesday": true,
                "thursday": true,
                "friday": true,
                "saturday": false,
                "sunday": false
            }
    }`);

    console.log("adding widget")
    let newalarmJq = $("#alarm-container").find("ul").append(alarmWidget.CreateAlarmWidget({alarm: defaultalarm}));
    // newalarmJq.find('input[data-toggle="toggle"]').bootstrapToggle(); // patch to prettyfi newly generated html
}

function getInputValue(element) {
    return getInputValueJq($(element));
}

function getInputValueJq(elementJq) {
        switch (elementJq.attr('type')) {
            case "checkbox":
            //return elementJq.get().checked;
            return elementJq.prop( "checked" );
        case "time":
            return elementJq.val();
        case "text":
            return elementJq.val();
    }
}

/**
 * Extract json data given jquery element of class alarmpi
 * @param alarmpi
 * @returns {{}}
 */
function alarmpiJsonSingle(alarmpi) {
    let newIndex = alarmpi.closest('li').index();
    let resultJson = {}

    alarmpi.find('.alarmpi-data').each(function (index) {
        let groupName = $(this).attr('id');
        resultJson[groupName] = {};

        $(this).find('input').each(function(index) {
            let value = getInputValue(this);
            let id = $(this).attr('id');

            resultJson[groupName][id] = value;
        });
    });
    resultJson["hidden"]["index"] = newIndex;

    return resultJson;
}

function alarmpiJsonAll() {
    let allAlarms = {}
    allAlarms["alarms"] = $('.alarmpi').map(function (){
        return alarmpiJsonSingle($(this));
    }).get();

    console.log(allAlarms);
    return allAlarms;
}

