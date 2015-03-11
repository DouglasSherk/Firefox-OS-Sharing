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

  _serverIndex(evt) {
    var response = evt.response;

    Promise.all([AppsService.instance.getInstalledApps(),
                 AppsService.instance.getInstalledAddons()]).then(results => {
      var apps = results[0];
      var addons = results[1];
      response.send(encodeURIComponent(JSON.stringify({
        name: this._deviceName,
        apps: AppsService.instance.pretty(apps),
        addons: AppsService.instance.pretty(addons)
      })));
    });
  }

  // The client is requesting a manifest for an app. This is used for displaying
  // a description and other info.
  _serverManifest(evt) {
    var response = evt.response;
    var request = evt.request;

    var appId = decodeURIComponent(request.params.app || '');

    AppsService.instance.getInstalledAppsAndAddons().then((appsAndAddons) => {
      appsAndAddons.forEach((app) => {
        if (app.manifestURL === appId) {

          response.headers['Content-Type'] =
            'application/x-web-app-manifest+json';
          var manifest = app.manifest;
          response.send(JSON.stringify(manifest));
        }
      });
    });
  }

  _serverDownload(evt) {
    var response = evt.response;
    var request = evt.request;

    var appId = decodeURIComponent(request.params.app || '');

    AppsService.instance.getInstalledAppsAndAddons().then((appsAndAddons) => {
      appsAndAddons.forEach((app) => {
        if (app.manifestURL === appId) {
          app.export().then((blob) => {
            response.headers['Content-Type'] = blob.type;
            response.sendFile(blob);
          });
        }
      });
    });
  }

  _serverRefresh(evt) {
    var response = evt.response;
    var request = evt.request;

    var peerName = request.params.peerName;
    this._dispatchEvent('refresh', { peerName: peerName });

    response.send('');
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
      var routes = {
        '/manifest.webapp': this._serverManifest.bind(this),
        '/download': this._serverDownload.bind(this),
        '/refresh': this._serverRefresh.bind(this),
        '/': this._serverIndex.bind(this)
      };
      var route = routes[path];
      if (route) {
        route(evt);
      }
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
