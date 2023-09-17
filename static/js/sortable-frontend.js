/**
 * See https://api.jqueryui.com/sortable/
 */
import * as alarmpi from "./alarmpi-frontend.js";

export function InitUI() {
    $( "#sortable" ).sortable({
        axis: "y",
        distance: 8,
        handle: ".alarmpi-ui-handle"
    });

    $('#sortable').on("sortupdate", function( event, ui ) {
        console.log("sorting updated");
    });
}
