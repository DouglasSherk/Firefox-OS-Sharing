import { Service } from 'fxos-mvc/dist/mvc';

import AppsService from 'app/js/services/apps_service';
import BroadcastService from 'app/js/services/broadcast_service';

class ShareService extends Service {
  getApps() {
    return new Promise((resolve, reject) => {
      Promise.all([BroadcastService.getBroadcast(),
                   AppsService.getApps()]).then(results => {
        var broadcast = results[0];
        var apps = results[1];

        resolve(broadcast ? apps : []);
      }, reject);
    });
  }
}

export default new ShareService();
