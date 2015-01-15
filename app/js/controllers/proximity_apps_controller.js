import { Controller } from 'components/fxos-mvc/dist/mvc';

import P2pService from 'js/services/p2p_service';
import AppsService from 'js/services/apps_service';

import ShareSummaryView from 'js/views/share_summary_view';
import ListView from 'js/views/list_view';

export default class ProximityAppsController extends Controller {
  constructor() {
    this.shareSummaryView = new ShareSummaryView();
    this.shareSummaryView.init(this);
    this.proximityAppsView = new ListView({
      id: 'proximity-apps',
      title: 'Nearby apps',
      type: 'download'
    });
    this.proximityAppsView.init(this);
    this.proximityAddonsView = new ListView({
      id: 'proximity-addons',
      title: 'Nearby addons',
      type: 'download'
    });
    this.proximityAddonsView.init(this);

    this.appsService = new AppsService();

    this.p2pService = new P2pService();
    this.p2pService.addBroadcastListener(this.broadcastChanged.bind(this));
    this.p2pService.addProximityListener(this.proximityChanged.bind(this));

    this.installedApps = {};
  }

  main() {
    this.shareSummaryView.render();
    document.body.appendChild(this.shareSummaryView.el);

    this.proximityChanged();
    document.body.appendChild(this.proximityAppsView.el);
    document.body.appendChild(this.proximityAddonsView.el);
  }

  teardown() {
    document.body.removeChild(this.shareSummaryView.el);
    document.body.removeChild(this.proximityAppsView.el);
    document.body.removeChild(this.proximityAddonsView.el);
  }

  broadcastChanged() {
    this.shareSummaryView.displayBroadcast(this.p2pService.broadcast);
  }

  proximityChanged() {
    this.proximityAppsView.render(
      this.appsService.flatten(this.p2pService.proximityApps));
    this.proximityAddonsView.render(
      this.appsService.flatten(this.p2pService.proximityAddons));
  }

  handleClick(e) {
    var appName = e.target.dataset.app;
    this.p2pService.downloadApp(appName);
  }

  openSharePanel() {
    window.location.hash = 'share';
  }
}
