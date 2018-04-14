#! /usr/bin/env node
const path = require('path');
const fs = require('fs');
const commandLineArgs = require('command-line-args');
const nodemon = require('nodemon');
const spawn = require('child_process').spawn;

const appStarted = '\nEZDoc server has started';
const appQuit = '\nEZDoc server has quit';
const appRestarted = '\nEZDoc server restarted';

const clientStarted = '\nEZDoc client has started';
const clientQuit = '\nEZDoc client has quit';

const startupError = '\nCan\'t start EZDoc';

const node = process.argv[0];

const args = commandLineArgs([
  {name: 'server-port', alias: 's', type: Number, defaultValue: 5001},
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
const clientPath = path.resolve(__dirname, "./lib/app/");

const spawnServerDev = () => {
  console.log('Starting EZDoc in dev mode...');
  return new Promise((resolve, reject) => {
    nodemon({
      script: serverPath,
      env: {
        PORT: args['server-port'],
        CONFIG: configPath,
        DEV_MODE: args.development
      }
    });

    nodemon.on('start', () => {
      console.log(appStarted);
      resolve();
    }).on('quit', () => {
      process.exit();
    }).on('restart', (files) => {
      console.log(appRestarted);
    }).on('crash', () => {
      reject();
    })
  });
};

const spawnServerProd = () => {
  console.log('Starting EZDoc...');
  return new Promise((resolve, reject) => {
    const server = spawn('node', [serverPath], {
      env: {
        PORT: args['server-port'],
        CONFIG: configPath
      }
    });

    server.stdout.on('data', (data) => {
      console.log(appStarted);
      console.log(data.toString());
      resolve();
    });

    server.stderr.on('data', (data) => {
      console.error(data.toString());
      reject();
    });

    server.on('exit', () => {
      process.exit();
    });
  });
};

const spawnClientDev = () => {
  const config = require(configPath);
  return new Promise((resolve, reject) => {
    const client = spawn(node, [path.resolve(__dirname, './node_modules/react-scripts/scripts/start.js')], {
      cwd: clientPath,
      env: {
        REACT_APP_PROXY_PORT: args['server-port'],
        REACT_APP_TITLE: config.title
      }
    });

    client.stdout.on('data', (data) => {
      console.log(data.toString());
      resolve();
    });

    client.stderr.on('data', (data) => {
      console.error(data.toString());
      reject();
    });

    client.on('exit', () => {
      process.exit();
    });
  });
};

if (args.development === true) {
  spawnServerDev()
    .then(spawnClientDev)
    .catch(() => {
      console.error(startupError);
    });
} else {
  spawnServerProd()
    .catch(() => {
      console.error(startupError);
    });
}

process.on('exit', function() {
  console.log(appQuit);
  console.log(clientQuit);
});
