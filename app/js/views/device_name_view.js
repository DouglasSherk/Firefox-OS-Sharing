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
        'click', this.controller.handleSubmit.bind(this.controller));

      this.el.addEventListener(
        'opened', this.controller.handleOpened.bind(this.controller));
      this.el.addEventListener(
        'closed', this.controller.handleClosed.bind(this.controller));

      this.inputEl.placeholder = 'Name your device';
    });
  }

  _handleSubmit(e) {
    this.controller.handleSubmit();
  }

  get value() {
    return this.el.els.input.value;
  }

  set value(val) {
    this.el.els.input.value = val;
  }
}
