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

  getPeerUrl(address) {
    return `http://${address}:8080`;
  }

  getAppDownloadUrl(app) {
    return `http://${app.address}:8080/download?app=${app.manifest.name}`;
  }

  getAppManifestUrl(app) {
    return `http://${app.address}:8080/manifest?app=${app.manifest.name}`;
  }
}
