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

    navigator.mozSettings.addObserver('deviceinfo.product_model', (e) => {
      this._updateDeviceName(e.settingValue);
    });

    var request =
      navigator.mozSettings.createLock().get('deviceinfo.product_model');

    request.onsuccess = () => {
      this._updateDeviceName(request.result['deviceinfo.product_model']);
    };

    request.onerror = (e) => {
      console.error('error getting deviceinfo.product_model: ' + e);
    };
  }

  static get instance() {
    if (!instance) {
      instance = new this(singletonGuard);
    }
    return instance;
  }

  _updateDeviceName(deviceName) {
    console.log('got deviceinfo.product_model');
    this._deviceName = deviceName;
    this._dispatchEvent('devicenamechange', {deviceName: deviceName});
  }
}
