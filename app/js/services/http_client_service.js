import { Service } from 'fxos-mvc/dist/mvc';

import Peer from 'app/js/models/peer';

import AppsService from 'app/js/services/apps_service';
import HttpService from 'app/js/services/http_service';

var singletonGuard = {};
var instance;

export default class HttpClientService extends Service {
  constructor(guard) {
    if (guard !== singletonGuard) {
      console.error('Cannot create singleton class');
      return;
    }

    this._cache = {};

    super();
  }

  static get instance() {
    if (!instance) {
      instance = new this(singletonGuard);
    }
    return instance;
  }

  downloadApp(app) {
    var url = HttpService.instance.getAppDownloadUrl(app);

    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest({ mozAnon: true, mozSystem: true });
      xhr.open('GET', url);
      xhr.responseType = 'blob';
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            AppsService.instance.installAppBlob(
              xhr.response).then(resolve, reject);
          } else {
            reject({name: 'HTTP error', message: xhr.status});
          }
        }
      };
      xhr.send();
    });
  }

  clearPeerCache(peer) {
    var url = HttpService.instance.getPeerUrl(peer);
    delete this._cache[url];
  }

  sendPeerInfo(fromPeer, toPeer) {
    return new Promise((resolve, reject) => {
      var url = HttpService.instance.getPeerUrl(toPeer);
      var body = Peer.stringify(fromPeer);

      if (this._cache[url] === body) {
        resolve();
        return;
      }

      var xhr = new XMLHttpRequest({ mozAnon: true, mozSystem: true });
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            this._cache[url] = body;
            resolve();
          } else {
            reject({name: 'HTTP error', message: xhr.status});
          }
        }
      };
      xhr.open('POST', url);
      xhr.send(body);
    });
  }
}
