import { Service } from 'fxos-mvc/dist/mvc';

class DeviceNameService extends Service {
  constructor() {
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
          this._isDefault = true;
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

  setDeviceName(deviceName) {
    return new Promise((resolve, reject) => {
      if (!deviceName) {
        reject();
        return;
      }

      var request = navigator.mozSettings.createLock().set({
        'lightsaber.device_name': deviceName});

      request.onsuccess = () => {
        this._isDefault = false;
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

  isDefault() {
    return this._isDefault;
  }

  signalDeviceNameCanceled() {
    if (this._isDefault) {
      this._dispatchEvent('devicenamechange-cancel');
    }
  }
}

export default new DeviceNameService();
