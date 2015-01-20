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

  installApp(appData) {
    navigator.mozApps.mgmt.import(appData).then((app) => {
      console.log('imported!');
    }, (e) => {
      console.error('error importing app', e);
    });

    /*
    console.log('AppsService::installApp(' + JSON.stringify(appData) + ')');
    var manifestURL =
      appData.url + '/manifest.webapp?app=' + appData.manifest.name;
    var dataURL = appData.url + '/download?app=' + appData.manifest.name;
    var type = appData.type;
    var installReq;
    if (type === 'hosted') {
      console.log('installing hosted app, ' + manifestURL);
      installReq = navigator.mozApps.install(manifestURL, {
        installMetaData: {
          url: dataURL
        }
      });
    } else if (type === 'packaged') {
      console.log('installing packaged app, ' + manifestURL);
      console.log('downloading: ' + dataURL);
      installReq = navigator.mozApps.installPackage(manifestURL, {
        installMetaData: {
          url: dataURL
        }
      });
    } else {
      throw new Error('Could not install app, unrecognized type: ' + type);
    }
    installReq.onerror = function(err) {
      console.error(err);
      window.alert('Error installing app: ' + err.target.error.name);
    };
    installReq.onsuccess = () => {
      window.alert('package installed!');
    };
    */
  }
}
