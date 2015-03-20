import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-icons/gaia-icons';
import 'gaia-text-input/gaia-text-input';
import 'gaia-dialog/gaia-dialog-prompt';

import DeviceNameService from 'app/js/services/device_name_service';

export default class DeviceNameView extends View {
  render() {
    this.el = document.createElement('gaia-dialog-prompt');

    super();

    setTimeout(() => {
      this.el.els.submit.addEventListener(
        'click', e => this.controller.handleSubmit(e));
      this.el.els.submit.disabled = true;

      this.el.addEventListener(
        'opened', e => this.controller.handleOpened(e));
      this.el.addEventListener(
        'closed', e => this.controller.handleClosed(e));

      this.el.els.input.placeholder = 'Name your device';
      this.el.els.input.addEventListener(
        'input', e => this.controller.handleInput(e));

      DeviceNameService.getDeviceName().then(deviceName => {
        this.value = deviceName;
        if (deviceName) {
          this.el.els.submit.disabled = false;
        }
      });
    });
  }

  get value() {
    return this.el.els.input.value;
  }

  set value(val) {
    this.el.els.input.value = val;
  }
}
