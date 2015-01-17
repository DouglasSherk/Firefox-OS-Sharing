import { Controller } from 'fxos-mvc/dist/mvc';

import DeviceNameService from 'app/js/services/device_name_service';

import DeviceNameView from 'app/js/views/device_name_view';

export default class DeviceNameController extends Controller {
  constructor() {
    this.view = new DeviceNameView();
    // XXX/drs: Shouldn't have to do this?
    this.view.init(this);
  }

  main() {
    this.view.render();
    document.body.appendChild(this.view.el);

    this._updateDeviceNameWrapped = this._updateDeviceName.bind(this);

    setTimeout(() => {
      this.view.open();
    });
  }

  handleOpened() {
    DeviceNameService.instance.addEventListener(
      'devicenamechange', this._updateDeviceNameWrapped, true);
  }

  handleClosed() {
    DeviceNameService.instance.removeEventListener(
      'devicenamechange', this._updateDeviceNameWrapped);

    document.body.removeChild(this.view.el);
  }

  handleSubmit() {
    DeviceNameService.instance.deviceName = this.view.value;
  }

  _updateDeviceName(e) {
    this.view.value = e.deviceName;
  }
}
