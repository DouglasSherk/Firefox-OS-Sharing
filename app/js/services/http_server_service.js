import /* global HTTPServer */ 'fxos-web-server/dist/fxos-web-server';

import { Service } from 'fxos-mvc/dist/mvc';

import AppsService from 'app/js/services/apps_service';
import DeviceNameService from 'app/js/services/device_name_service';

var singletonGuard = {};
var instance;

export default class HttpServerService extends Service {
  constructor(guard) {
    if (guard !== singletonGuard) {
      console.error('Cannot create singleton class');
      return;
    }

    super();

    window.addEventListener('beforeunload', this._deactivate.bind(this));

    DeviceNameService.instance.addEventListener('devicenamechange', (e) => {
      this._deviceName = e.deviceName;
    }, true);

    this._activate();
  }

  static get instance() {
    if (!instance) {
      instance = new this(singletonGuard);
    }
    return instance;
  }

  get broadcast() {
    return null;
  }

  set broadcast(val) {
    this._broadcast = val;
  }

  _activate() {
    if (this.httpServer) {
      return;
    }

    this.httpServer = new HTTPServer(8080);
    this.httpServer.addEventListener('request', (evt) => {
      var response = evt.response;
      var request = evt.request;

      if (!this._broadcast) {
        response.send('');
        return;
      }

      var path = request.path;
      var appId = decodeURIComponent(request.params.app || '');
      AppsService.instance.getInstalledAppsAndAddons().then((appsAndAddons) => {
        if (path !== '/') {
          appsAndAddons.forEach((app) => {
            if (app.manifestURL === appId) {

              // The client is requesting a manifest for an app. This is used
              // for displaying a description and other info.
              if (path === '/manifest.webapp') {
                response.headers['Content-Type'] =
                  'application/x-web-app-manifest+json';
                var manifest = app.manifest;
                response.send(JSON.stringify(manifest));

              // The client is requesting an app binary.
              } else if (path === '/download') {
                app.export().then((blob) => {
                  response.headers['Content-Type'] = blob.type;
                  response.sendFile(blob);
                });
              }
            }
          });
        // The client is requesting a list of all apps.
        } else {
          AppsService.instance.getInstalledApps().then((apps) => {
            AppsService.instance.getInstalledAddons().then((addons) => {
              response.send(encodeURIComponent(JSON.stringify({
                name: this._deviceName,
                apps: AppsService.instance.pretty(apps),
                addons: AppsService.instance.pretty(addons)
              })));
            });
          });
        }
      });
    });
    this.httpServer.start();
  }

  _deactivate() {
    if (!this.httpServer) {
      return;
    }

    this.httpServer.stop();
    this.httpServer = null;
  }
}
