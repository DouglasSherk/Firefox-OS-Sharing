import { Service } from 'fxos-mvc/dist/mvc';

var singletonGuard = {};
var instance;

export default class AppsService extends Service {
  constructor(guard) {
    if (guard !== singletonGuard) {
      console.error('Cannot create singleton class');
      return;
    }

    super();
  }

  static get instance() {
    if (!instance) {
      instance = new this(singletonGuard);
    }
    return instance;
  }

  getInstalledApps() {
    var excludedApps = ['Marketplace', 'In-app Payment Tester', 'Membuster',
      'Share Receiver', 'Template', 'Test Agent', 'Test receiver#1',
      'Test Receiver#2', 'Test receiver (inline)', 'Test Shared CSS',
      'UI tests - Privileged App', 'Sheet app 1', 'Sheet app 2', 'Sheet app 3'];

    return this._getAppsSubset((app) => {
      return app.manifest.role !== 'system' &&
             app.manifest.type !== 'certified' &&
             excludedApps.indexOf(app.manifest.name) === -1 &&
             !app.manifest.customizations;
    });
  }

  getInstalledAddons() {
    return this._getAppsSubset((app) => {
      return !!app.manifest.customizations;
    });
  }

  installAppBlob(appData) {
    var sdcard = navigator.getDeviceStorage('sdcard');
    if (!sdcard) {
      console.error('No SD card!');
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
          navigator.mozApps.mgmt.import(file).then((app) => {
            window.alert(`${app.manifest.name} installed!`);
          }, (e) => {
            console.error('error installing app', e);
          });
        };

        getReq.onerror = () => {
          console.error('error getting file', getReq.error.name);
        };
      };

      req.onerror = (e) => {
        console.error('error saving blob', e);
      };
    };
  }

  getInstalledApp(appName) {
    return new Promise((resolve, reject) => {
      this.getInstalledApps().then((apps) => {
        for (var i in apps) {
          var app = apps[i];
          if (app.manifest.name === appName) {
            resolve(app);
            return;
          }
        }
        console.error('No app found by name', appName);
        reject();
        return;
      }, (e) => { reject(e); });
    });
  }

  // Helper method to flatten an app manifest down to only the fields necessary
  // for networking.
  pretty(apps) {
    var prettyApps = [];
    apps.forEach((app) => {
      prettyApps.push({
        type: app.type,
        manifest: {
          name: app.manifest.name,
          description: app.manifest.description
        }
      });
    });
    return JSON.stringify(prettyApps);
  }

  // Flattens a collection of apps in the format:
  // [
  //   'owner1': [
  //     { manifest: { name: 'app1', ... } },
  //     { manifest: { name: 'app2', ... } }
  //   ],
  //   'owner2': [
  //     { manifest: { name: 'app3', ... } },
  //     { manifest: { name: 'app4', ... } }
  //   ]
  // ]
  //
  // Down to:
  // [
  //   { manifest: { name: 'app1', ... }, owner: 'owner1' },
  //   { manifest: { name: 'app2', ... }, owner: 'owner1' },
  //   { manifest: { name: 'app3', ... }, owner: 'owner2' },
  //   ...
  // ]
  flatten(owners) {
    var flattenedApps = [];
    for (var owner in owners) {
      var apps = owners[owner].apps;
      for (var i = 0; i < apps.length; i++) {
        var app = apps[i];
        app.owner = owner;
        flattenedApps.push(app);
      }
    }
    return flattenedApps;
  }

  _getAppsSubset(subsetCallback) {
    return new Promise((resolve, reject) => {
      var installedApps = [];

      var req = navigator.mozApps.mgmt.getAll();

      req.onsuccess = () => {
        var result = req.result;

        // Strip out apps that we shouldn't share.
        for (var index in result) {
          var app = result[index];
          if (subsetCallback(app)) {
            installedApps.push(app);
          }
        }

        resolve(installedApps);
      };

      req.onerror = e => {
        console.log('error fetching installed apps: ', e);
        reject(e);
      };
    });
  }
}
