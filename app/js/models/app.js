import { Model } from 'fxos-mvc/dist/mvc';

export default class App extends Model {
  static getApp(apps, filters) {
    return apps.find(app => {
      for (var filter in filters) {
        if (app[filter] === filters[filter] ||
            app.manifest[filter] === filters[filter]) {
          return true;
        }
      }
      return false;
    });
  }

  static markInstalledApps(installedApps, apps) {
    return apps.map(app => {
      if (App.getApp(installedApps, {manifestURL: app.manifestURL})) {
        app.installed = true;
      }
      return app;
    });
  }

  static markSharedApps(sharedApps, apps) {
    return apps.map(app => {
      if (App.getApp(sharedApps, {manifestURL: app.manifestURL})) {
        app.shared = true;
      }
      return app;
    });
  }

  static filterDefaults(apps) {
    var filterOrigins = ['app://marketplace-dev.allizom.org',
                         'app://marketplace.allizom.org',
                         'http://mochi.test:8888'];

    return apps.filter(app => app.manifest.role !== 'system' &&
                              app.removable === true &&
                              filterOrigins.indexOf(app.origin) === -1);
  }

  static filterApps(apps) {
    return apps.filter(app =>
      app.manifest.role !== 'addon' &&
      app.manifest.role !== 'theme');
  }

  static filterAddons(apps) {
    return apps.filter(app => app.manifest.role === 'addon');
  }

  static filterThemes(apps) {
    return apps.filter(app => app.manifest.role === 'theme');
  }

  static filterMarketplaces(apps) {
    var filterManifestURLs = [
      'https://marketplace.firefox.com/packaged.webapp',
      'app://directory.gaiamobile.org/manifest.webapp'
    ];
    return apps.filter(
      app => filterManifestURLs.indexOf(app.manifestURL) !== -1);
  }
}
