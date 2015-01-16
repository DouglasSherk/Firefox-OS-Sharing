import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-icons/gaia-icons';
import 'gaia-text-input/gaia-text-input';
import 'gaia-dialog/gaia-dialog-confirm';

export default class DeviceNameView extends View {
  template() {
    // XXX/drs: gaia-text-input doesn't open the keyboard. Use a standard
    // <input> element for now.
    /*
    <gaia-text-input id="device-name" placeholder="Device name">
    </gaia-text-input>
    */
    var string = `
      <gaia-dialog-confirm>
        <input id="device-name-input" placeholder="Device name"></input>
      </gaia-dialog-confirm>`;
    return string;
  }

  render() {
    super();

    setTimeout(() => {
      this.dialogElt = this.$('gaia-dialog-confirm');
      this.deviceNameElt = document.getElementById('device-name-input');
    });
  }

  open() {
    this.dialogElt.open();
  }

  get value() {
    return this.deviceNameElt.value;
  }

  set value(val) {
    this.deviceNameElt.value = val;
  }
}
