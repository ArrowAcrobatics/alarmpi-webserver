# Run
This server application is configured to run using `pm2`. For reference see the example `alarmpi-pm2.config.cjs` file.

https://pm2.keymetrics.io/docs/usage/quick-start/

Basic usage:
```pm2 start ./alarmpi-pm2.config.cjs```

To run at startup execute the command that `pm2 start` tells you to run. This only sets up the 'master' daemon process. 
To respawn any dead processes etc. launch all desired processes and then run `pm2 save` to freeze the process list.

Note: pm2 installed using `sudo npm install pm2@latest -g`.

To unlink pm2 from startup: `pm2 unstartup systemd`.