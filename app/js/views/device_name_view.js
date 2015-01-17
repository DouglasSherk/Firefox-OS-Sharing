import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-icons/gaia-icons';
import 'gaia-text-input/gaia-text-input';
import 'gaia-dialog/gaia-dialog-prompt';

export default class DeviceNameView extends View {
  render() {
    this.el = document.createElement('gaia-dialog-prompt');
    this.el.addEventListener('opened', this._handleOpened.bind(this));
    this.el.addEventListener('closed', this._handleClosed.bind(this));
    // XXX/drs: Yikes, we should probably expose this a bit better in the WC.
    this.el.els.submit.addEventListener(
      'click', this._handleSubmit.bind(this));
  }

  open() {
    this.el.open();
  }

  get value() {
    return this.el.els.input.value;
  }

  set value(val) {
    this.el.els.input.value = val;
  }

  _handleOpened() {
    this.controller.handleOpened();
  }

  _handleClosed() {
    this.controller.handleClosed();
  }

  _handleSubmit() {
    this.controller.handleSubmit();
  }
}
