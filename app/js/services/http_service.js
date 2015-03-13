import { Service } from 'fxos-mvc/dist/mvc';

var singletonGuard = {};
var instance;

export default class HttpClientService extends Service {
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

  getPeerUrl(peer) {
    return `http://${peer.address}:8080`;
  }

  getAppDownloadUrl(app) {
    var id = encodeURIComponent(app.manifestURL);
    return `http://${app.peer.address}:8080/download?app=${id}`;
  }

  getAppManifestUrl(app) {
    var id = encodeURIComponent(app.manifestURL);
    return `http://${app.peer.address}:8080/manifest?app=${id}`;
  }
}
