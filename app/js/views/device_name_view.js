import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-icons/gaia-icons';
import 'gaia-text-input/gaia-text-input';
import 'gaia-dialog/gaia-dialog';

export default class DeviceNameView extends View {
  template() {
    var string = `
      <h1>Change device name</h1>
      <p>Ugly due to a limitation in web components. See bug 1079236.</p>
      <input id="device-name-input"></input>
      <section>
        <button id="device-name-cancel">Cancel</button>
        <button id="device-name-submit">Ok</button>
      </section>
    `;
    return string;
  }

  render() {
    this.el = document.createElement('gaia-dialog');

    super();

    setTimeout(() => {
      this.cancelButtonEl = document.getElementById('device-name-cancel');
      this.submitButtonEl = document.getElementById('device-name-submit');
      this.inputEl = document.getElementById('device-name-input');

      this.cancelButtonEl.addEventListener(
        'click', this.el.close.bind(this.el));
      this.submitButtonEl.addEventListener(
        'click', this._handleSubmit.bind(this));

      this.el.addEventListener(
        'opened', this.controller.handleOpened.bind(this.controller));
      this.el.addEventListener(
        'closed', this.controller.handleClosed.bind(this.controller));
    });
  }

  get value() {
    return this.inputEl.value;
  }

  set value(val) {
    this.inputEl.value = val;
  }

  _handleSubmit(e) {
    this.controller.handleSubmit();
    this.el.close();
  }

  // XXX/drs: Bug 1079236 prevents us from opening the keyboard when focusing
  // an input element that is inside a shadow DOM tree. For now, replace it
  // with a text input.
  /*
  render() {
    this.el = document.createElement('gaia-dialog-prompt');
    this.el.addEventListener('opened', this._handleOpened.bind(this));
    this.el.addEventListener('closed', this._handleClosed.bind(this));
    // XXX/drs: Yikes, we should probably expose this a bit better in the WC.
    this.el.els.submit.addEventListener(
      'click', this._handleSubmit.bind(this));
  }

  get value() {
    return this.el.els.input.value;
  }

  set value(val) {
    this.el.els.input.value = val;
  }
  */
}
