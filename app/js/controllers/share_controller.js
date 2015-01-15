import { Controller } from 'components/fxos-mvc/dist/mvc';

import P2pService from 'js/services/p2p_service';
import AppsService from 'js/services/apps_service';

import ShareSettingsView from 'js/views/share_settings_view';
import ListView from 'js/views/list_view';

export default class ShareController extends Controller {
  constructor() {
    this.shareSettingsView = new ShareSettingsView();
    this.shareSettingsView.init(this);
    this.sharedAppsView = new ListView('shared-apps', 'My apps', 'toggle');
    this.sharedAddonsView =
      new ListView('shared-addons', 'My addons', 'toggle');

    this.appsService = new AppsService();

    this.p2pService = new P2pService();
    this.p2pService.addBroadcastListener(this.broadcastChanged.bind(this));
  }

  main() {
    this.appsService.getInstalledApps().then((apps) => {
      this.shareSettingsView.render();
      document.body.appendChild(this.shareSettingsView.el);

      this.sharedAppsView.render(apps);
      document.body.appendChild(this.sharedAppsView.el);

      this.sharedAddonsView.render(apps);
      document.body.appendChild(this.sharedAddonsView.el);
    });
  }

  teardown() {
    document.body.removeChild(this.shareSettingsView.el);
    document.body.removeChild(this.sharedAppsView.el);
    document.body.removeChild(this.sharedAddonsView.el);
  }

  toggleBroadcasting() {
    this.p2pService.broadcast = !this.p2pService.broadcast;
  }

  broadcastChanged() {
    this.shareSettingsView.displayBroadcast(this.p2pService.broadcast);
  }
}
