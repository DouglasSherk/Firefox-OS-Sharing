import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-icons';
import 'gaia-text-input';
import 'gaia-dialog';

import DeviceNameService from 'app/js/services/device_name_service';

export default class DeviceNameView extends View {
  render() {
    this.el = document.createElement('gaia-dialog-prompt');

    super();

    setTimeout(() => {
      this.els = this.el.els;

      this.els.submit.addEventListener(
        'click', e => this.controller.handleSubmit(e));
      this.els.submit.disabled = true;

      this.el.addEventListener(
        'opened', e => this.controller.handleOpened(e));
      this.el.addEventListener(
        'closed', e => this.controller.handleClosed(e));

      this.els.input.placeholder = 'Name your device';
      this.els.input.addEventListener(
        'input', e => this.controller.handleInput(e));

      DeviceNameService.getDeviceName().then(deviceName => {
        this.value = deviceName;
        if (deviceName) {
          this.els.submit.disabled = false;
        }
      });
    });
  }

  get value() {
    return this.els.input.value;
  }

  set value(val) {
    this.els.input.value = val;
  }
}
