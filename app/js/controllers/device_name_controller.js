import { Controller } from 'fxos-mvc/dist/mvc';

import DeviceNameService from 'app/js/services/device_name_service';

export default class DeviceNameController extends Controller {
  constructor(options) {
    super(options);

    this.view.render();
    document.body.appendChild(this.view.el);

    DeviceNameService.addEventListener(
      'devicenamechange', (e) => this._updateDeviceName(e), true);
  }

  main() {
    this.view.el.open();
  }

  handleOpened() {
  }

  handleClosed() {
    DeviceNameService.signalDeviceNameCanceled();
  }

  handleSubmit() {
    DeviceNameService.setDeviceName(this.view.value);
  }

  handleInput() {
    this.view.el.els.submit.disabled = !this.view.value;
  }

  _updateDeviceName(e) {
    this.view.value = e.deviceName;
  }
}
