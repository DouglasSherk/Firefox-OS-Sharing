export default class AppsService {
  getInstalledApps() {
    return new Promise((resolve, reject) => {
      this.installedApps = {};
      var req = navigator.mozApps.mgmt.getAll();

      req.onsuccess = () => {
        var apps = req.result;
        resolve(apps);
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
    var manifest = appData.manifestURL;
    var type = appData.type;
    var installReq;
    if (type === 'hosted') {
      console.log('installing hosted app, ' + manifest);
      installReq = navigator.mozApps.install(manifest, {
        installMetaData: {
          url: appData.url
        }
      });
    } else if (type === 'packaged') {
      console.log('installing packaged app, ' + manifest);
      installReq = navigator.mozApps.installPackage(manifest, {
        installMetaData: {
          url: appData.url
        }
      });
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
