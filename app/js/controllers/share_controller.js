import { Controller } from 'components/fxos-mvc/dist/mvc';

import P2pService from 'js/services/p2p_service';
import AppsService from 'js/services/apps_service';

import ShareSettingsView from 'js/views/share_settings_view';
import ListView from 'js/views/list_view';

import DeviceNameController from 'js/controllers/device_name_controller';

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

    this.appsService = new AppsService();
    this.p2pService = new P2pService();

    this._broadcastChangedWrapped = this.broadcastChanged.bind(this);
  }

  main() {
    this.appsService.getInstalledApps().then((apps) => {
      this.shareSettingsView.render();
      document.body.appendChild(this.shareSettingsView.el);

      this.sharedAppsView.render(apps);
      document.body.appendChild(this.sharedAppsView.el);

      this.appsService.getInstalledAddons().then((addons) => {
        this.sharedAddonsView.render(addons);
        document.body.appendChild(this.sharedAddonsView.el);
      });
    });

    this.p2pService.addBroadcastListener(this._broadcastChangedWrapped);
  }

  teardown() {
    document.body.removeChild(this.shareSettingsView.el);
    document.body.removeChild(this.sharedAppsView.el);
    document.body.removeChild(this.sharedAddonsView.el);

    this.p2pService.removeBroadcastListener(this._broadcastChangedWrapped);
  }

  toggleBroadcasting(toggle) {
    this.p2pService.broadcast = toggle;
  }

  broadcastChanged() {
    var broadcast = this.p2pService.broadcast;
    this.shareSettingsView.displayBroadcast(broadcast);
    this.sharedAppsView.toggle(!broadcast);
    this.sharedAddonsView.toggle(!broadcast);
  }

  handleRenameDevice() {
    this.deviceNameController.main();
  }
}
