import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-button/gaia-button';
import 'gaia-switch/gaia-switch';

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
        'change', this._handleShareEnabledChange.bind(this));

      this.shareDescriptionElt = document.getElementById('share-description');

      this.renameDeviceBtn = this.$('.rename-device');
      this.renameDeviceBtn.addEventListener(
        'click', this._handleRenameDevice.bind(this));

      this.deviceNameElt = document.getElementById('device-name');
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
          <h4 id="device-name">Loading...</h4>
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

    // XXX/drs: We have to wait for this to load for some reason.
    setTimeout(() => {
      this.shareEnabledElt.setChecked(!!enabled);
    }, 500);
  }

  get deviceName() {
    console.error('DONT USE ME LOL!');
    return this.deviceNameElt.textContent;
  }

  set deviceName(deviceName) {
    setTimeout(() => {
      this.deviceNameElt.textContent = deviceName;
    });
  }

  _handleShareEnabledChange(e) {
    this.controller.toggleBroadcasting(e.target.checked);
  }

  _handleRenameDevice(e) {
    this.controller.handleRenameDevice();
  }
}
