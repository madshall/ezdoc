const express = require('express');
const fs = require('fs');
const path = require('path');
const isPackage = require('validate-npm-package-name');
const request = require('request');
const npm = require('npm');

const app = express();

const port = process.env.PORT || 5000;
const configPath = process.env.CONFIG;
const is = {
  local: /\.md$/,
  external: /^http(s)?:\/\//
};

const resolveLocal = (resource) => {
  return new Promise((resolve, reject) => {
    const fileName = path.resolve(path.dirname(configPath), resource);
    fs.readFile(fileName, 'utf-8', (error, contents) => {
      if (error) {
        return reject();
      }
      resolve({
        type: "local",
        contents: contents
      });
    });
  });
};

const resolveExternal = (resource) => {
  return new Promise((resolve, reject) => {
    request(resource, (error, contents) => {
      if (error) {
        return reject(error);
      }
      resolve({
        type: "external",
        contents: contents.body,
        status: contents.statusCode
      });
    })
  });
};

const resolvePackage = (resource) => {

  const getPackageInfo = () => {
    return new Promise((resolve, reject) => {
      npm.load((error, npm) => {
        if (error) {
          return reject('Can\'t load npm for resolving the package');
        }

        npm.commands.show([resource], true, (error, contents) => {
          if (error) {
            return reject('Can\'t retrieve info for the package');
          }

          const result = contents[Object.keys(contents)[0]];

          if (typeof result === undefined) {
            return reject('Can\'t retrieve version for the package');
          }

          resolve({
            type: "package",
            ...result
          });
        });
      });
    });
  };

  const getPackageReadme = () => {
    return new Promise((resolve, reject) => {
      npm.load((error, npm) => {
        if (error) {
          return reject('Can\'t load npm for resolving the package');
        }

        npm.commands.show([resource, 'readme'], true, (error, contents) => {
          if (error) {
            return reject('Can\'t retrieve readme for the package');
          }

          const result = contents[Object.keys(contents)[0]];

          if (typeof result === undefined) {
            return reject('Can\'t retrieve version for the package');
          }

          const { readme, other } = result;
          resolve({
            type: "package",
            ...other,
            contents: readme
          });
        });
      });
    });
  };

  return Promise.all([getPackageInfo(), getPackageReadme()]).then((results) => {
    return Object.assign({}, ...results);
  });
};


const resolveResource = (resource) => {
  return new Promise((resolve, reject) => {
    if (is.external.test(resource)) {
      resolveExternal(resource).then(resolve, reject);
    } else if (is.local.test(resource)) {
      resolveLocal(resource).then(resolve, reject);
    } else if (isPackage(resource)) {
      resolvePackage(resource).then(resolve, reject);
    } else {
      reject('Can\'t resolve the resource type');
    }
  });
};

try {
  const config = require(configPath);

  if (!process.env.DEV_MODE) {
    app.use(express.static(path.join(__dirname, '../app/build')));

    app.get('/', function (req, res) {
      res.sendFile(path.join(__dirname, '../app/build', 'index.html'));
    });
  }

  app.get('/api/config', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*').json(config);
  });

  app.get('/api/resource', (req, res) => {
    const resource = req.query.res;
    setTimeout(() => {
      resolveResource(resource)
        .then(result => {
          result.resource = resource;
          res.header('Access-Control-Allow-Origin', '*').json(result);
        })
        .catch(e => {
          res.status(404).send(e);
        });

    }, 3e3);
  });
} catch(e) {
  console.error(e);
  process.exit();
}

app.listen(port, function() {
  console.log('Server is listening on port', port);
});