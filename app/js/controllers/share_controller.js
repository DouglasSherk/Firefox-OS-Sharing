import { Controller } from 'fxos-mvc/dist/mvc';

import App from 'app/js/models/app';

import AppsService from 'app/js/services/apps_service';
import BroadcastService from 'app/js/services/broadcast_service';
import DeviceNameService from 'app/js/services/device_name_service';

import ShareSettingsView from 'app/js/views/share_settings_view';
import ListView from 'app/js/views/list_view';

export default class ShareController extends Controller {
  constructor() {
    this.shareSettingsView = new ShareSettingsView();
    this.shareSettingsView.init(this);
    this.sharedAppsView = new ListView({
      id: 'shared-apps',
      title: 'My apps',
      type: 'toggle',
      disabled: true
    });
    this.sharedAppsView.init(this);
    this.sharedAddonsView = new ListView({
      id: 'shared-addons',
      title: 'My add-ons',
      type: 'toggle',
      disabled: true
    });
    this.sharedAddonsView.init(this);
    this.sharedThemesView = new ListView({
      id: 'shared-themes',
      title: 'My themes',
      type: 'toggle',
      disabled: true
    });
    this.sharedThemesView.init(this);

    BroadcastService.addEventListener(
      'broadcast', e => this.broadcastChanged(e), true);

    DeviceNameService.instance.addEventListener(
      'devicenamechange', e => this.deviceNameChanged(e), true);

    AppsService.addEventListener(
      'updated', () => this.appsChanged(), true);

    this.header = 'Share My Apps';
  }

  main() {
    document.body.appendChild(this.shareSettingsView.el);
    document.body.appendChild(this.sharedAppsView.el);
    document.body.appendChild(this.sharedAddonsView.el);
    document.body.appendChild(this.sharedThemesView.el);
  }

  teardown() {
    document.body.removeChild(this.shareSettingsView.el);
    document.body.removeChild(this.sharedAppsView.el);
    document.body.removeChild(this.sharedAddonsView.el);
    document.body.removeChild(this.sharedThemesView.el);
  }

  appsChanged() {
    AppsService.getApps().then(apps => {
      this.sharedAppsView.render(App.filterApps(apps));
      this.sharedAddonsView.render(App.filterAddons(apps));
      this.sharedThemesView.render(App.filterThemes(apps));
    });
  }

  toggleBroadcasting(toggle) {
    BroadcastService.setBroadcast(toggle);
  }

  broadcastChanged(e) {
    var broadcast = e.broadcast;
    this.shareSettingsView.displayBroadcast(broadcast);
    this.sharedAppsView.toggle(!broadcast);
    this.sharedAddonsView.toggle(!broadcast);
    this.sharedThemesView.toggle(!broadcast);
  }

  deviceNameChanged(e) {
    this.shareSettingsView.deviceName = e.deviceName;
  }

  handleRenameDevice() {
    var deviceNameController =
      window.routingController.controller('device_name');
    deviceNameController.main();
  }

  toggle(e) {
    var el = e.target.querySelector('.control');
    el.toggle();
  }

  description(e) {
    // Everything gets handled by `toggle()`.
  }
}
