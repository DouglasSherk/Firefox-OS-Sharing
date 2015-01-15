import { View } from 'components/fxos-mvc/dist/mvc';

import 'components/gaia-component-utils/index';
import 'components/gaia-confirm/script';

export default class DeviceNameView extends View {
  template() {
    var string = `
      <gaia-confirm></gaia-confirm>
    `;
    return string;
  }
}
