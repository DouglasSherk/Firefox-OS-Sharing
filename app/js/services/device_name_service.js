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

    navigator.mozSettings.addObserver('lightsaber.device_name', (e) => {
      this._deviceName = e.settingValue;
      this._dispatchEvent('devicenamechange', {deviceName: e.settingValue});
    });

    this._initialized = new Promise((resolve, reject) => {
      var request =
        navigator.mozSettings.createLock().get('lightsaber.device_name');

      request.onsuccess = () => {
        var result = request.result['lightsaber.device_name'];

        if (result) {
          this._deviceName = result;
          resolve();
        } else {
          this._setDeviceNameToDefault(resolve, reject);
        }
      };

      request.onerror = (e) => {
        console.error('error getting lightsaber.device_name: ' + e);
        reject(e);
      };
    }).then(() => {
      this._dispatchEvent('devicenamechange', {deviceName: this._deviceName});
    });
  }

  static get instance() {
    if (!instance) {
      instance = new this(singletonGuard);
    }
    return instance;
  }

  setDeviceName(deviceName) {
    return new Promise((resolve, reject) => {
      var request = navigator.mozSettings.createLock().set({
        'lightsaber.device_name': deviceName});

      request.onsuccess = () => {
        this._dispatchEvent('devicenamechange', {deviceName: deviceName});
        resolve();
      };

      request.onerror = (e) => {
        console.error('error setting lightsaber.device_name: ' + e);
        reject(e);
      };
    });
  }

  getDeviceName() {
    return new Promise((resolve, reject) => {
      return this._initialized.then(() => {
        resolve(this._deviceName);
      });
    });
  }

  _setDeviceNameToDefault(resolve, reject) {
    var request =
      navigator.mozSettings.createLock().get('deviceinfo.product_model');

    request.onsuccess = () => {
      this._deviceName = request.result['deviceinfo.product_model'];
      resolve();
    };

    request.onerror = (e) => {
      console.error('error getting deviceinfo.product_model', e);
      reject(e);
    };
  }
}
