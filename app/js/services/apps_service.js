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
      var apps = owners[owner];
      for (var i = 0; i < apps.length; i++) {
        var app = apps[i];
        app.owner = owner;
        flattenedApps.push(app);
      }
    }
    return flattenedApps;
  }

  installApp(appData) {
    console.log('AppsService::installApp(' + JSON.stringify(appData) + ')');
    var manifestURL =
      appData.url + '/manifest.webapp?app=' + appData.manifest.name;
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
