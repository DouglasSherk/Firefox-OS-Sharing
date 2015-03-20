import { Service } from 'fxos-mvc/dist/mvc';

export default class UrlService extends Service {
  static getPeerUrl(peer) {
    return `http://${peer.address}:8080/peer`;
  }

  static getPeerPingUrl(peer) {
    return `http://${peer.address}:8080`;
  }

  static getPeerDisconnectUrl(peer) {
    return `http://${peer.address}:8080/disconnect`;
  }

  static getAppDownloadUrl(app) {
    var id = encodeURIComponent(app.manifestURL);
    return `http://${app.peer.address}:8080/download?app=${id}`;
  }

  static getAppManifestUrl(app) {
    var id = encodeURIComponent(app.manifestURL);
    return `http://${app.peer.address}:8080/manifest?app=${id}`;
  }
}
