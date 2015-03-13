import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-icons/gaia-icons';
import 'gaia-text-input/gaia-text-input';
import 'gaia-dialog/gaia-dialog-prompt';

export default class DeviceNameView extends View {
  render() {
    this.el = document.createElement('gaia-dialog-prompt');

    super();

    setTimeout(() => {
      this.cancelButtonEl = this.el.els.cancel;
      this.submitButtonEl = this.el.els.submit;
      this.inputEl = this.el.els.input;

      this.submitButtonEl.addEventListener(
        'click', e => this.controller.handleSubmit(e));

      this.el.addEventListener(
        'opened', e => this.controller.handleOpened(e));
      this.el.addEventListener(
        'closed', e => this.controller.handleClosed(e));

      this.inputEl.placeholder = 'Name your device';
    });
  }

  get value() {
    return this.el.els.input.value;
  }

  set value(val) {
    this.el.els.input.value = val;
  }
}
