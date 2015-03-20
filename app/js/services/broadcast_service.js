import { Service } from 'fxos-mvc/dist/mvc';

class BroadcastService extends Service {
  constructor() {
    super();

    this._initialized = new Promise((resolve, reject) => {
      navigator.mozSettings.addObserver('lightsaber.p2p_broadcast', e => {
        this._broadcastLoaded(e.settingValue);
      });

      var broadcastSetting = navigator.mozSettings.createLock().get(
        'lightsaber.p2p_broadcast', false);

      broadcastSetting.onsuccess = () => {
        this._broadcastLoaded(
          broadcastSetting.result['lightsaber.p2p_broadcast']);
        resolve();
      };

      broadcastSetting.onerror = () => {
        console.error('error getting `lightsaber.p2p_broadcast` setting');
        reject();
      };
    });
  }

  getBroadcast() {
    return new Promise((resolve, reject) => {
      this._initialized.then(() => {
        resolve(this._broadcast);
      }, reject);
    });
  }

  setBroadcast(val) {
    new Promise((resolve, reject) => {
      var request = navigator.mozSettings.createLock().set({
       'lightsaber.p2p_broadcast': val});

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (e) => {
        console.error('error getting `lightsaber.p2p_broadcast` setting');
        reject(e);
      };
    });
  }

  _broadcastLoaded(val) {
    this._broadcast = val;
    this._dispatchEvent('broadcast', {broadcast: val});
  }
}

export default new BroadcastService();
