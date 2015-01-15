import { View } from 'components/fxos-mvc/dist/mvc';

import 'components/gaia-button/gaia-button';

export default class ShareSettingsView extends View {
  constructor() {
    this.el = document.createElement('gaia-list');
    this.el.id = 'share-settings';
  }

  render() {
    super();

    setTimeout(() => {
      this.shareEnabledElt = document.getElementById('share-enabled');
      this.shareEnabledElt.addEventListener(
        'click', this._handleClick.bind(this));

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
  }

  _handleClick(e) {
    this.controller.toggleBroadcasting();
  }

  _handleRenameDevice(e) {
    this.controller.handleRenameDevice();
  }
}
