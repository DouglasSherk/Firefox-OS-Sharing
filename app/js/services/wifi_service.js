import { Service } from 'fxos-mvc/dist/mvc';

class WifiService extends Service {
  constructor(options) {
    super(options);

    navigator.mozWifiManager.addEventListener(
      'statuschange', (e) => this._statusChange(e.status));
  }

  isConnected() {
    return navigator.mozWifiManager.connection.status === 'connected';
  }

  _statusChange(status) {
    this._dispatchEvent('statuschange', {status: status});
  }
}

export default new WifiService();
