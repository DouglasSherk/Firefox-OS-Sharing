import { View } from 'components/fxos-mvc/dist/mvc';

import 'components/gaia-icons/gaia-icons';
import 'components/gaia-text-input/gaia-text-input';
import 'components/gaia-dialog/gaia-dialog-confirm';

export default class DeviceNameView extends View {
  template() {
    var string = `
      <gaia-dialog-confirm>
        <gaia-text-input id="device-name" placeholder="Device name">
        </gaia-text-input>
      </gaia-dialog-confirm>`;
    return string;
  }

  render() {
    super();

    setTimeout(() => {
      this.dialogElt = this.$('gaia-dialog-confirm');
    });
  }

  open() {
    this.dialogElt.open();
  }
}
