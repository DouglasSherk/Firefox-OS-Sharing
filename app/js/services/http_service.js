import { Service } from 'fxos-mvc/dist/mvc';

class HttpService extends Service {
  getPeerUrl(peer) {
    return `http://${peer.address}:8080/peer`;
  }

  getPeerPingUrl(peer) {
    return `http://${peer.address}:8080`;
  }

  getPeerDisconnectUrl(peer) {
    return `http://${peer.address}:8080/disconnect`;
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

export default new HttpService();
