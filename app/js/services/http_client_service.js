import { Service } from 'fxos-mvc/dist/mvc';

import Peer from 'app/js/models/peer';

import AppsService from 'app/js/services/apps_service';
import HttpService from 'app/js/services/http_service';

var singletonGuard = {};
var instance;

const TIMEOUT = 2000;

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
      xhr.onload = () => {
        if (xhr.status === 200) {
          AppsService.instance.installAppBlob(
            xhr.response).then(resolve, reject);
        }
      };
      this._xhrAttachErrorListeners(xhr, reject, app.peer);
      xhr.send();
    });
  }

  clearPeerCache(peer) {
    if (peer !== undefined) {
      var url = HttpService.instance.getPeerUrl(peer);
      delete this._cache[url];
    } else {
      this._cache = [];
    }
  }

  sendPeerInfo(fromPeer, toPeer) {
    return new Promise((resolve, reject) => {
      var url = HttpService.instance.getPeerUrl(toPeer);
      var body = Peer.stringify(fromPeer);
      var isCacheHit = this._cache[url] === body;

      var xhr = new XMLHttpRequest({ mozAnon: true, mozSystem: true });
      if (isCacheHit) {
        // We got a cache hit, so just ping the peer instead of sending our full
        // info.
        url = HttpService.instance.getPeerPingUrl(toPeer);
      }
      xhr.open(isCacheHit ? 'GET' : 'POST', url);
      xhr.onload = () => {
        if (xhr.status === 200) {
          this._cache[url] = body;
          resolve();
        }
      };
      this._xhrAttachErrorListeners(xhr, reject, toPeer);
      xhr.send(isCacheHit ? '' : body);
    });
  }

  signalDisconnecting(peer) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest({ mozAnon: true, mozSystem: true });
      xhr.open('GET', HttpService.instance.getPeerDisconnectUrl(peer));
      xhr.send();
    });
  }

  _xhrAttachErrorListeners(xhr, reject, peer) {
    xhr.timeout = TIMEOUT;
    xhr.ontimeout = () => {
      reject({name: 'Timeout'});
      this._dispatchEvent('disconnect', {peer: peer});
    };
    xhr.onerror = () => {
      reject({name: 'Network error'});
      this._dispatchEvent('disconnect', {peer: peer});
    };
    xhr.addEventListener('load', () => {
      if (xhr.status !== 200) {
        reject({name: 'HTTP error', message: xhr.status});
        this._dispatchEvent('disconnect', {peer: peer});
      }
    });
  }
}
