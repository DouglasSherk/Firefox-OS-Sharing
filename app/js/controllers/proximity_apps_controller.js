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
      title: 'Available apps',
      type: 'download'
    });
    this.proximityAppsView.init(this);
    this.proximityAddonsView = new ListView({
      id: 'proximity-addons',
      title: 'Available addons',
      type: 'download'
    });
    this.proximityAddonsView.init(this);

    P2pService.instance.addEventListener(
      'proximity', this.proximityChanged.bind(this));

    this.installedApps = {};

    this._broadcastChangedWrapped = this.broadcastChanged.bind(this);
  }

  main() {
    this.shareSummaryView.render();
    document.body.appendChild(this.shareSummaryView.el);

    this.proximityChanged();
    document.body.appendChild(this.proximityAppsView.el);
    document.body.appendChild(this.proximityAddonsView.el);

    P2pService.instance.addEventListener(
      'broadcast', this._broadcastChangedWrapped, true);
  }

  teardown() {
    document.body.removeChild(this.shareSummaryView.el);
    document.body.removeChild(this.proximityAppsView.el);
    document.body.removeChild(this.proximityAddonsView.el);

    P2pService.instance.removeEventListener(
      'broadcast', this._broadcastChangedWrapped);
  }

  broadcastChanged() {
    this.shareSummaryView.displayBroadcast(P2pService.instance.broadcast);
  }

  proximityChanged() {
    this.proximityAppsView.render(
      AppsService.instance.flatten(P2pService.instance.proximityApps));
    this.proximityAddonsView.render(
      AppsService.instance.flatten(P2pService.instance.proximityAddons));
  }

  handleClick(e) {
    var appName = e.target.dataset.app;
    P2pService.instance.downloadApp(appName);
  }

  openSharePanel() {
    window.location.hash = 'share';
  }
}
