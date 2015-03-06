import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-button/gaia-button';
import 'gaia-switch/gaia-switch';

export default class ShareSettingsView extends View {
  constructor() {
    this.el = document.createElement('gaia-list');
    this.el.id = 'share-settings';

    this.render();
  }

  render() {
    super();

    setTimeout(() => {
      this.shareEnabledElt = this.$('#share-enabled');
      this.shareEnabledElt.addEventListener(
        'change', this._handleShareEnabledChange.bind(this));

      this.shareDescriptionElt = this.$('#share-description');

      this.renameDeviceBtn = this.$('#rename-device');
      this.renameDeviceBtn.addEventListener(
        'click', this._handleRenameDevice.bind(this));

      this.deviceNameElt = this.$('#device-name');
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
      <li class="borderless">
        <gaia-button disabled id="rename-device">Rename Device</gaia-button>
      </li>
    `;

    return string;
  }

  displayBroadcast(enabled) {
    setTimeout(() => {
      this.shareDescriptionElt.textContent = enabled ?
        'Sharing On' : 'Turn on to share apps';

      if (enabled) {
        this.shareEnabledElt.setAttribute('checked', '');
      } else {
        this.shareEnabledElt.removeAttribute('checked');
      }
    }, 0);
  }

  get deviceName() {
    console.error('DONT USE ME LOL!');
    return this.deviceNameElt.textContent;
  }

  set deviceName(deviceName) {
    setTimeout(() => {
      this.renameDeviceBtn.removeAttribute('disabled');
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
