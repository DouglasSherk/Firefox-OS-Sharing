import /* global HTTPServer */ 'fxos-web-server/dist/fxos-web-server';

import { Service } from 'fxos-mvc/dist/mvc';

import AppsService from 'app/js/services/apps_service';

var singletonGuard = {};
var instance;

export default class HttpServerService extends Service {
  constructor(guard) {
    if (guard !== singletonGuard) {
      console.error('Cannot create singleton class');
      return;
    }

    super();

    window.addEventListener('beforeunload', this.deactivate.bind(this));
  }

  static get instance() {
    if (!instance) {
      instance = new this(singletonGuard);
    }
    return instance;
  }

  activate() {
    if (this.httpServer) {
      return;
    }

    this.httpServer = new HTTPServer(8080);
    this.httpServer.addEventListener('request', (evt) => {
      var response = evt.response;
      var request = evt.request;

      var path = request.path;
      var appName = request.params.app;
      AppsService.instance.getInstalledApps().then((apps) => {
        if (path !== '/') {
          apps.forEach((app) => {
            if (app.manifest.name === appName) {

              // The client is requesting a manifest for an app. This is used for
              // displaying a description and other info.
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
          response.send(JSON.stringify({
            name: 'blah',
            apps: AppsService.instance.pretty(apps)
          }));
        }
      });
    });
    this.httpServer.start();
  }

  deactivate() {
    this.httpServer.stop();
    this.httpServer = null;
  }
}
