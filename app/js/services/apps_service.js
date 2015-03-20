import { Service } from 'fxos-mvc/dist/mvc';

import App from 'app/js/models/app';

class AppsService extends Service {
  constructor() {
    super();

    this._apps = [];
    this._getApps();

    var mgmt = navigator.mozApps.mgmt;
    mgmt.addEventListener('install', app => this._handleInstall(app));
    mgmt.addEventListener('uninstall', app => this._handleUninstall(app));
  }

  installAppBlob(appData) {
    return new Promise((resolve, reject) => {
      var sdcard = navigator.getDeviceStorage('sdcard');
      if (!sdcard) {
        console.error('No SD card!');
        reject({name: 'No SD card!'});
        return;
      }

      var fileName = 'temp-app.zip';
      var delReq = sdcard.delete(fileName);
      delReq.onsuccess = delReq.onerror = () => {
        var req = sdcard.addNamed(
          new Blob([appData], {type: 'application/openwebapp+zip'}),
          fileName);

        req.onsuccess = () => {
          var getReq = sdcard.get(fileName);

          getReq.onsuccess = () => {
            var file = getReq.result;
            navigator.mozApps.mgmt.import(file).then(app => {
              resolve(app);
            }, (e) => {
              console.error('error installing app', e);
              reject(e);
            });
          };

          getReq.onerror = () => {
            console.error('error getting file', getReq.error.name);
            reject(getReq.error);
          };
        };

        req.onerror = e => {
          console.error('error saving blob', e);
          reject(e);
        };
      };
    });
  }

  markInstalledAppsInProximityApps(peers) {
    return new Promise((resolve, reject) => {
      this._getApps().then(() => {
        resolve(peers);
      });
    });
    /*
        for (var peerIndex in peers) {
          var peer = peers[peerIndex];

          ['apps', 'addons', 'themes'].forEach(appType => {
            if (!peer[appType]) {
              return;
            }

            for (var i = peer[appType].length - 1; i >= 0; i--) {
              var app = peer[appType][i];
              var matchingApp = this._apps.find((installedApp) => {
                return installedApp.manifest.name === app.manifest.name;
              });

              if (matchingApp) {
                peer[appType][i].installed = true;
              }
            }
          });
        }
        resolve(peers);
      });
    });
    */
  }

  getApps() {
    return new Promise((resolve, reject) => {
      this._getApps().then(() => {
        resolve(this._apps);
      }, reject);
    });
  }

  _getApp(app, resolve) {
    // XXX/drs: This is higher than we need, but some apps scale have
    // icons as low as 16px, which look really bad. I'd rather we
    // scale them down than up.
    navigator.mozApps.mgmt.getIcon(app, '128').then(icon => {
      var fr = new FileReader();
      fr.addEventListener('loadend', () => {
        app.icon = fr.result;
        this._apps.push(app);
        if (resolve) { resolve(); }
      });
      fr.readAsDataURL(icon);
    }, () => {
      app.icon = 'icons/default.png';
      this._apps.push(app);
      if (resolve) { resolve(); }
    });
  }

  _getApps() {
    if (!this._initialized) {
      this._initialized = new Promise((oresolve, reject) => {
        this._apps = [];

        var iconPromises = [];

        var req = navigator.mozApps.mgmt.getAll();
        req.onsuccess = () => {
          var result = req.result;

          for (var index in result) {
            var app = result[index];
            iconPromises.push(new Promise((resolve, reject) =>
              this._getApp(app, resolve)
            ));
          }

          Promise.all(iconPromises).then(() => {
            this._apps = App.filterDefaults(this._apps);
            oresolve(this._apps);
            this._dispatchEvent('updated');
          });
        };

        req.onerror = (e) => {
          console.error('error fetching installed apps: ', e);
          reject(e);
        };
      });
    }

    return this._initialized;
  }

  _handleInstall(e) {
    var app = e.application;

    var updateApp = () => {
      (new Promise((resolve, reject) => {
        this._apps = this._apps.filter((installedApp) =>
          app.manifestURL !== installedApp.manifestURL);
        this._getApp(app, resolve);
      })).then(() => {
        this._dispatchEvent('updated');
      });
    };

    if (app.downloading) {
      var downloaded = () => {
        app.removeEventListener('downloadsuccess', downloaded);
        updateApp();
      };
      app.addEventListener('downloadsuccess', downloaded);
    } else {
      updateApp();
    }
  }

  _handleUninstall(e) {
    var app = e.application;
    this._apps = this._apps.filter((installedApp) =>
      app.manifestURL !== installedApp.manifestURL);
    this._dispatchEvent('updated');
  }
}

export default new AppsService();
