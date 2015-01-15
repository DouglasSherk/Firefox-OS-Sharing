import { View } from 'components/fxos-mvc/dist/mvc';

import 'components/gaia-icons/gaia-icons';
import 'components/gaia-text-input/gaia-text-input';
import 'components/gaia-dialog/gaia-dialog';

export default class DeviceNameView extends View {
  template() {
    var string = `
      <gaia-dialog>
        <gaia-text-input id="device-name"></gaia-text-input>
        <section>
          <button>Ok</button>
          <button>Cancel</button>
        </section>
      </gaia-dialog>`;
    return string;
  }

  render() {
    super();

    setTimeout(() => {
      this.dialogElt = this.$('gaia-dialog');
    });
  }

  open() {
    this.dialogElt.open();
  }
}
