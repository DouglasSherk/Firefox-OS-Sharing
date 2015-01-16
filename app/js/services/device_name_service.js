import { Service } from 'fxos-mvc/dist/mvc';

var singletonGuard = {};
var instance;

export default class DeviceNameService extends Service {
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

  getDeviceName() {
    return new Promise((resolve, reject) => {
      var request =
        navigator.mozSettings.createLock().get('deviceinfo.product_model');

      request.onsuccess = () => {
        resolve(request.result['deviceinfo.product_model']);
      };

      request.onerror = (e) => {
        console.error('Error getting device product model: ' + e);
        reject(e);
      };
    });
  }

  setDeviceName(name) {
    navigator.mozSettings.createLock().set({'deviceinfo.product_model': name});
  }
}
