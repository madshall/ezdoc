#! /usr/bin/env node
const path = require('path');
const fs = require('fs');
const commandLineArgs = require('command-line-args');
const nodemon = require('nodemon');
const spawn = require('child_process').spawn;

const appStarted = '\nEZDoc server has started';
const appQuit = '\nEZDoc server has quit';
const appRestarted = '\nEZDoc server restarted';

const args = commandLineArgs([
  {name: 'server-port', alias: 's', type: Number, defaultValue: 5001},
  {name: 'client-port', alias: 'c', type: Number, defaultValue: 5000},
  {name: 'config', type: String, defaultOption: true},
  {name: 'development', alias: 'd', type: Boolean, defaultOption: false}
]);

const configPath = path.resolve(__dirname, args.config);

if (!args.config) {
  console.error('--config is required. Please, provide path to EZDoc configuration file');
  process.exit();
} else {
  try {
    fs.readFileSync(configPath);
    console.log('Config file found at', configPath);
  } catch(e) {
    console.error('Can\'t find config file at', configPath);
    process.exit();
  }
}

const serverPath = path.resolve(__dirname, "./lib/server/index.js");

const spawnDev = () => {
  console.log('Starting EZDoc in dev mode...');
  nodemon({
    script: serverPath,
    env: {
      PORT: args['server-port'],
      CONFIG: configPath
    }
  });

  nodemon.on('start', function () {
    console.log(appStarted);
  }).on('quit', function () {
    process.exit();
  }).on('restart', function (files) {
    console.log(appRestarted);
  });
};

const spawnProd = () => {
  console.log('Starting EZDoc...');
  const server = spawn('node', [serverPath], {
    env: {
      PORT: args['server-port'],
      CONFIG: configPath
    }
  });

  server.stdout.on('data', function(data) {
    console.log(appStarted);
    console.log(data.toString());
  });

  server.stderr.on('data', function(data) {
    console.error(data.toString());
  });

  server.on('exit', function() {
    process.exit();
  });
};

if (args.development === true) {
  spawnDev();
} else {
  spawnProd();
}

process.on('exit', function() {
  console.log(appQuit);
});