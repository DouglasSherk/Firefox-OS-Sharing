import { Service } from 'fxos-mvc/dist/mvc';

import Peer from 'app/js/models/peer';

import AppsService from 'app/js/services/apps_service';
import HttpService from 'app/js/services/http_service';

const TIMEOUT = 2000;

class HttpClientService extends Service {
  downloadApp(app) {
    var url = HttpService.getAppDownloadUrl(app);

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

  sendPeerInfo(fromPeer, toPeer) {
    return new Promise((resolve, reject) => {
      var url = HttpService.getPeerUrl(toPeer);
      var body = Peer.stringify(fromPeer);

      var xhr = new XMLHttpRequest({ mozAnon: true, mozSystem: true });
      xhr.open('POST', url);
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve();
        }
      };
      this._xhrAttachErrorListeners(xhr, reject, toPeer);
      xhr.send(body);
    });
  }

  signalDisconnecting(peer) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest({ mozAnon: true, mozSystem: true });
      xhr.open('GET', HttpService.getPeerDisconnectUrl(peer));
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

export default new HttpClientService();
