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
    var excludedApps = ['Marketplace', 'In-app Payment Tester', 'Membuster',
      'Share Receiver', 'Template', 'Test Agent', 'Test receiver#1',
      'Test Receiver#2', 'Test receiver (inline)', 'Test Shared CSS',
      'UI tests - Privileged App', 'Sheet app 1', 'Sheet app 2', 'Sheet app 3',
      'NFC API tests'];

    var excludedThemes =
      ['Default Theme', 'Test theme 1', 'Test theme 2', 'Broken theme 3'];

    return apps.filter(app => app.manifest.role !== 'system' &&
                              app.manifest.type !== 'certified' &&
                              excludedApps.indexOf(app.manifest.name) === -1 &&
                              excludedThemes.indexOf(app.manifest.name) === -1);
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
}
