export default class AppsService {
  getInstalledApps() {
    return this._getAppsSubset((app) => {
      return app.manifest.role !== 'system' &&
             app.manifest.type !== 'certified' &&
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

  flatten(addresses) {
    var flattenedApps = [];
    for (var address in addresses) {
      var apps = addresses[address];
      for (var i = 0; i < apps.length; i++) {
        var app = apps[i];
        app.owner = address;
        flattenedApps.push(app);
      }
    }
    return flattenedApps;
  }

  installApp(appData) {
    console.log('AppsService::installApp(' + JSON.stringify(appData) + ')');
    var manifestURL = appData.url + '/manifest?app=' + appData.manifest.name;
    var type = appData.type;
    var installReq;
    if (type === 'hosted') {
      console.log('installing hosted app, ' + manifestURL);
      installReq = navigator.mozApps.install(manifestURL);
    } else if (type === 'packaged') {
      console.log('installing packaged app, ' + manifestURL);
      installReq = navigator.mozApps.installPackage(manifestURL);
    } else {
      throw new Error('Could not install app, unrecognized type: ' + type);
    }
    installReq.onerror = function(err) {
      console.log('install error', err);
    };
    installReq.onsuccess = () => {
      window.alert('package installed!');
    };
  }
}
