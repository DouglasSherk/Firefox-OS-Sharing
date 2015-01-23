import { Service } from 'fxos-mvc/dist/mvc';

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

    super();
  }

  static get instance() {
    if (!instance) {
      instance = new this(singletonGuard);
    }
    return instance;
  }

  downloadApp(url) {
    var xhr = new XMLHttpRequest({ mozAnon: true, mozSystem: true });
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        AppsService.instance.installAppBlob(xhr.response);
      }
    };
    xhr.send();
  }

  requestPeerInfo(address) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest({ mozAnon: true, mozSystem: true });
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          var peer = JSON.parse(xhr.responseText);
          resolve(peer);
        }
      };
      xhr.open('GET', HttpService.instance.getPeerUrl(address));
      xhr.send();
    });
  }
}
