import { Controller } from 'fxos-mvc/dist/mvc';

import P2pService from 'app/js/services/p2p_service';
import AppsService from 'app/js/services/apps_service';
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

    P2pService.instance.addEventListener(
      'broadcast', this.broadcastChanged.bind(this), true);

    DeviceNameService.instance.addEventListener(
      'devicenamechange', this.deviceNameChanged.bind(this), true);

    this.appsChanged();
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
    AppsService.instance.getInstalledApps().then((apps) => {
      this.sharedAppsView.render(apps);
    });

    AppsService.instance.getInstalledAddons().then((addons) => {
      this.sharedAddonsView.render(addons);
    });

    AppsService.instance.getInstalledThemes().then((themes) => {
      this.sharedThemesView.render(themes);
    });
  }

  toggleBroadcasting(toggle) {
    P2pService.instance.broadcast = toggle;
  }

  broadcastChanged() {
    var broadcast = P2pService.instance.broadcast;
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
}
