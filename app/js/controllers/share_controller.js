import { Controller } from 'fxos-mvc/dist/mvc';

import P2pService from 'app/js/services/p2p_service';
import AppsService from 'app/js/services/apps_service';
import DeviceNameService from 'app/js/services/device_name_service';

import ShareSettingsView from 'app/js/views/share_settings_view';
import ListView from 'app/js/views/list_view';

import DeviceNameController from 'app/js/controllers/device_name_controller';

export default class ShareController extends Controller {
  constructor() {
    this.deviceNameController = new DeviceNameController();

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
      title: 'My addons',
      type: 'toggle',
      disabled: true
    });
    this.sharedAddonsView.init(this);

    this._broadcastChangedWrapped = this.broadcastChanged.bind(this);
    this._deviceNameChangedWrapped = this.deviceNameChanged.bind(this);
  }

  main() {
    AppsService.instance.getInstalledApps().then((apps) => {
      this.shareSettingsView.render();
      document.body.appendChild(this.shareSettingsView.el);

      this.sharedAppsView.render(apps);
      document.body.appendChild(this.sharedAppsView.el);

      AppsService.instance.getInstalledAddons().then((addons) => {
        this.sharedAddonsView.render(addons);
        document.body.appendChild(this.sharedAddonsView.el);
      });
    });

    P2pService.instance.addEventListener(
      'broadcast', this._broadcastChangedWrapped, true);

    DeviceNameService.instance.addEventListener(
      'devicenamechange', this._deviceNameChangedWrapped, true);
  }

  teardown() {
    document.body.removeChild(this.shareSettingsView.el);
    document.body.removeChild(this.sharedAppsView.el);
    document.body.removeChild(this.sharedAddonsView.el);

    P2pService.instance.removeEventListener(
      'broadcast', this._broadcastChangedWrapped);

    DeviceNameService.instance.removeEventListener(
      'devicenamechange', this._deviceNameChangedWrapped);
  }

  toggleBroadcasting(toggle) {
    P2pService.instance.broadcast = toggle;
  }

  broadcastChanged() {
    var broadcast = P2pService.instance.broadcast;
    this.shareSettingsView.displayBroadcast(broadcast);
    this.sharedAppsView.toggle(!broadcast);
    this.sharedAddonsView.toggle(!broadcast);
  }

  deviceNameChanged(e) {
    this.shareSettingsView.deviceName = e.deviceName;
  }

  handleRenameDevice() {
    this.deviceNameController.main();
  }
}
