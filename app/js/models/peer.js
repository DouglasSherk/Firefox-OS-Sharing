import { Model } from 'fxos-mvc/dist/mvc';

import AppsService from 'app/js/services/apps_service';
import DeviceNameService from 'app/js/services/device_name_service';

export default class Peer extends Model {
  static getMe() {
    return new Promise((resolve, reject) => {
      Promise.all([AppsService.getApps(),
                   DeviceNameService.getDeviceName()]).then(result => {
        var apps = result[0];
        var deviceName = result[1];
        resolve({
          name: deviceName,
          session: window.session,
          apps: apps
        });
      }, reject);
    });
  }

  // Helper method to flatten a peer down to only the fields necessary for
  // networking.
  static stringify(peer) {
    var peerObj = {};
    for (var i in peer) {
      peerObj[i] = peer[i];
    }

    peerObj.apps = peer.apps.map(app => {
      return {
        type: app.type,
        manifest: {
          name: app.manifest.name,
          description: app.manifest.description,
          developer: {
            name: (app.manifest.developer && app.manifest.developer.name) || ''
          },
          role: app.manifest.role,
          type: app.manifest.type
        },
        manifestURL: app.manifestURL,
        icon: app.icon
      };
    });

    return JSON.stringify(peerObj);
  }
}
