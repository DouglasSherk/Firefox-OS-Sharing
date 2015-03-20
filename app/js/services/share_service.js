import { Service } from 'fxos-mvc/dist/mvc';

import AppsService from 'app/js/services/apps_service';
import BroadcastService from 'app/js/services/broadcast_service';

class ShareService extends Service {
  constructor() {
    super();

    this._shares = {};

    this._initialized = new Promise((resolve, reject) => {
      navigator.getDataStores('p2p_shares').then(stores => {
        this._store = stores[0];
        this._store.getLength().then(length => {
          if (!length) {
            resolve();
            return;
          }

          var cursor = this._store.sync();
          this._runNextTask(cursor, resolve, reject);
        });
      });
    }).then(() => this._dispatchEvent('share'));
  }

  getApps() {
    window.ShareService = this;

    return new Promise((resolve, reject) => {
      Promise.all([BroadcastService.getBroadcast(),
                   AppsService.getApps(),
                   this._initialized]).then(results => {
        var broadcast = results[0];
        if (!broadcast) {
          resolve([]);
          return;
        }

        var apps = results[1];
        resolve(apps.filter(app => !!this._shares[app.manifestURL]));
      }, reject);
    });
  }

  setAppShare(app, enable) {
    return new Promise((resolve, reject) => {
      if (enable) {
        this._store.add(app.manifestURL).then(id => {
          this._loadShare(id, app.manifestURL);
          resolve();
          this._dispatchEvent('share');
        }, reject);
      } else {
        this._store.remove(this._shares[app.manifestURL]).then(success => {
          if (success) {
            delete this._shares[app.manifestURL];
            resolve();
            this._dispatchEvent('share');
          } else {
            reject();
          }
        }, reject);
      }
    });
  }

  _runNextTask(cursor, resolve, reject) {
    cursor.next().then(task => this._manageTask(cursor, task, resolve, reject));
  }

  _manageTask(cursor, task, resolve, reject) {
    switch (task.operation) {
    case 'done':
      resolve();
      break;
    case 'add':
      this._loadShare(task.id, task.data);
      /* falls through */
    default:
      this._runNextTask(cursor, resolve, reject);
      break;
    }
  }

  _loadShare(id, manifestURL) {
    this._shares[manifestURL] = id;
  }
}

export default new ShareService();
