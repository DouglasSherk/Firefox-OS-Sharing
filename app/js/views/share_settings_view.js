import { View } from 'components/fxos-mvc/dist/mvc';

import 'components/gaia-button/gaia-button';
import 'components/gaia-switch/gaia-switch';

export default class ShareSettingsView extends View {
  constructor() {
    this.el = document.createElement('gaia-list');
    this.el.id = 'share-settings';
  }

  render() {
    super();

    setTimeout(() => {
      this.shareEnabledElt = document.getElementById('share-enabled');

      this.shareDescriptionElt = document.getElementById('share-description');

      this.renameDeviceBtn = this.$('.rename-device');
      this.renameDeviceBtn.addEventListener(
        'click', this._handleRenameDevice.bind(this));
    });
  }

  template() {
    var string = `
      <li>
        <div>
          <h3>Share My Apps</h3>
          <h4 id="share-description">Turn on to share apps</h4>
        </div>
        <gaia-switch id="share-enabled"></gaia-switch>
      </li>
      <li>
        <div>
          <h3>Device Name</h3>
          <h4 id="device-name">Doug Phone</h4>
        </div>
        <i class="forward-light"></i>
      </li>
      <li>
        <gaia-button class="rename-device">Rename Device</gaia-button>
      </li>
    `;

    return string;
  }

  displayBroadcast(enabled) {
    this.shareDescriptionElt.textContent = enabled ?
      'Sharing On' : 'Turn on to share apps';
    this.shareEnabledElt.setChecked(!!enabled);

    // We should only hook this after the first update since we don't want the
    // initial automatic call to fool us into thinking that the user tapped the
    // button.
    this.shareEnabledElt.addEventListener(
      'change', this._handleShareEnabledChange.bind(this));
  }

  _handleShareEnabledChange(e) {
    this.controller.toggleBroadcasting();
  }

  _handleRenameDevice(e) {
    this.controller.handleRenameDevice();
  }
}
