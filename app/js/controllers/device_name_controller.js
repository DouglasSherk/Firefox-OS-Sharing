import { Controller } from 'fxos-mvc/dist/mvc';

import DeviceNameService from 'app/js/services/device_name_service';

import DeviceNameView from 'app/js/views/device_name_view';

export default class DeviceNameController extends Controller {
  constructor() {
    this.view = new DeviceNameView();
  }

  main() {
    this.view.render();
    document.body.appendChild(this.view.el);

    this._updateDeviceNameWrapped = this._updateDeviceName.bind(this);

    setTimeout(() => {
      this.view.el.addEventListener('opened', this._handleOpened.bind(this));
      this.view.el.addEventListener('closed', this._handleClosed.bind(this));

      this.view.open();
    });
  }

  _handleOpened() {
    console.log('adding listener');
    DeviceNameService.instance.addEventListener(
      'devicenamechange', this._updateDeviceNameWrapped, true);
  }

  _handleClosed() {
    console.log('removing listener');
    DeviceNameService.instance.removeEventListener(
      'devicenamechange', this._updateDeviceNameWrapped);
  }

  _updateDeviceName(e) {
    console.log('got deviceName: ' + JSON.stringify(e));
    this.view.value = e.deviceName;
  }
}
