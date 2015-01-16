import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-icons/gaia-icons';
import 'gaia-text-input/gaia-text-input';
import 'gaia-dialog/gaia-dialog-prompt';

export default class DeviceNameView extends View {
  template() {
    var string = `<gaia-dialog-prompt></gaia-dialog-prompt>`;
    return string;
  }

  render() {
    super();

    setTimeout(() => {
      this.el = this.$('gaia-dialog-prompt');
    });
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
}
