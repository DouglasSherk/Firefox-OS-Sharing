import { Service } from 'fxos-mvc/dist/mvc';

import App from 'app/js/models/app';

import AppsService from 'app/js/services/apps_service';
import BroadcastService from 'app/js/services/broadcast_service';

// Prune the database 60 seconds after opening the app.
const PRUNE_TIMER = 60000;

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
          this._runNextTask(
            cursor, resolve, reject, (id, data) => this._loadShare(id, data));
        });
      });

      setTimeout(() => this._pruneStore(), PRUNE_TIMER);
    }).then(() => this._dispatchEvent('share'));
  }

  getApps() {
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

  _runNextTask(cursor, resolve, reject, cb) {
    cursor.next().then(task =>
      this._manageTask(cursor, task, resolve, reject, cb));
  }

  _manageTask(cursor, task, resolve, reject, cb) {
    switch (task.operation) {
    case 'done':
      resolve();
      break;
    case 'add':
      cb(task.id, task.data);
      /* falls through */
    default:
      this._runNextTask(cursor, resolve, reject, cb);
      break;
    }
  }

  _loadShare(id, manifestURL) {
    this._shares[manifestURL] = id;
  }

  /**
   * Pruning
   *
   * Keep the DataStore clean by pruning apps that somehow had multiple entries
   * added, or are no longer installed.
   */

  _pruneShare(id, data) {
    AppsService.getApps().then(apps => {
      var app = App.getApp(apps, {manifestURL: data});
      // If this app isn't installed, or has occurred multiple times in the
      // DataStore, delete it.
      if (!app || this._prunedShares[data]) {
        this._store.remove(id);
      }
      this._prunedShares[data] = id;
    });
  }

  _pruneStore() {
    new Promise((resolve, reject) => {
      this._initialized.then(() => {
        // Keep an array with all of the app instances that we've run into so
        // far, to determine uniqueness.
        this._prunedShares = {};
        var cursor = this._store.sync();
        this._runNextTask(
          cursor, resolve, reject, (id, data) => this._pruneShare(id, data));
      });
    // Clear the array as it's no longer needed.
    }).then(() => delete this._prunedShares);
  }
}

export default new ShareService();
