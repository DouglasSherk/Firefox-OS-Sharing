import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-button';
import 'gaia-switch';

export default class ShareSettingsView extends View {
  constructor(options) {
    super(options);

    this.el = document.createElement('gaia-list');
    this.el.id = 'share-settings';
    this.el.classList.add('app-list');

    this.render();
  }

  render() {
    super();

    setTimeout(() => {
      this.els = {};

      this.els.shareEnabled = this.$('#share-enabled');
      this.els.shareEnabled.addEventListener(
        'change', e => this._handleShareEnabledChange(e));

      this.els.shareDescription = this.$('#share-description');

      this.els.renameDevice = this.$('#rename-device');

      this.els.deviceName = this.$('#device-name');

      this.on('click', '#rename-device');
    });
  }

  template() {
    var string =
      `<li>
        <div flex>
          <h3>Share My Apps</h3>
          <h4 id="share-description">Turn on to share apps</h4>
        </div>
        <gaia-switch id="share-enabled"></gaia-switch>
      </li>
      <li>
        <div flex>
          <h3>Device Name</h3>
          <h4 id="device-name">Loading...</h4>
        </div>
        <a aria-disabled="true" data-action="rename" id="rename-device">
          Rename
        </a>
      </li>`;

    return string;
  }

  displayBroadcast(enabled) {
    setTimeout(() => {
      this.els.shareDescription.textContent = enabled ?
        'Sharing On' : 'Turn on to share apps';

      if (enabled) {
        this.els.shareEnabled.setAttribute('checked', '');
      } else {
        this.els.shareEnabled.removeAttribute('checked');
      }
    }, 0);
  }

  get deviceName() {
    console.error('DONT USE ME LOL!');
    return this.els.deviceName.textContent;
  }

  set deviceName(deviceName) {
    setTimeout(() => {
      this.els.renameDevice.removeAttribute('aria-disabled');
      this.els.deviceName.textContent = deviceName;
    });
  }

  _handleShareEnabledChange(e) {
    this.controller.toggleBroadcasting(e.target.checked);
  }
}
