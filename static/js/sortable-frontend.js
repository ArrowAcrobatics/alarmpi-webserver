import * as alarmpi from "./alarmpi-frontend.js";

export function InitUI() {
    $( "#sortable" ).sortable({
        axis: "y",
        // delay: 150,
        distance: 8
    });
    // TODO: add handle icon for mobile friendliness.
    // other option: https://sortablejs.github.io/Sortable/
    // $("#target").disableSelection();
    // $("#sortableDivId").sortable({
    //     handle: ".ui-icon"
    // });

    $('#sortable').on("sortupdate", function( event, ui ) {
        console.log("sorting updated");
    });
}
