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
      this._dispatchEvent('devicenamechange', {deviceName: e.settingValue});
    });

    var request =
      navigator.mozSettings.createLock().get('lightsaber.device_name');

    request.onsuccess = () => {
      var result = request.result['lightsaber.device_name'];

      if (result) {
        this._deviceName = result;
      } else {
        this._setDeviceNameToDefault();
      }
    };

    request.onerror = (e) => {
      console.error('error getting lightsaber.device_name: ' + e);
    };
  }

  static get instance() {
    if (!instance) {
      instance = new this(singletonGuard);
    }
    return instance;
  }

  set deviceName(deviceName) {
    var request = navigator.mozSettings.createLock().set({
      'lightsaber.device_name': deviceName});

    request.onsuccess = () => {
      this._dispatchEvent('devicenamechange', {deviceName: deviceName});
    };

    request.onerror = (e) => {
      console.error('error setting lightsaber.device_name: ' + e);
    };
  }

  get deviceName() {
    console.log('this._deviceName: ' + this._deviceName);
    return this._deviceName;
  }

  _setDeviceNameToDefault() {
    var request =
      navigator.mozSettings.createLock().get('deviceinfo.product_model');

    request.onsuccess = () => {
      this._deviceName = request.result['deviceinfo.product_model'];
    };

    request.onerror = (e) => {
      console.error('error getting deviceinfo.product_model', e);
    };
  }
}
