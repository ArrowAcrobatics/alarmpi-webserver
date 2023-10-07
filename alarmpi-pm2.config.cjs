module.exports = {
    apps : [{
        name   : "alarmpi",
        script : "./index.js",
        restart_delay: 10000,
        watch: true,
        ignore_watch: [
            "./node_modules",
            "./sounds",
            "./alarms",
            "./static/js/gen"
        ]
    }]
}