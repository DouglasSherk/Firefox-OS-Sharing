import { Controller } from 'fxos-mvc/dist/mvc';

import P2pService from 'app/js/services/p2p_service';

import ShareSummaryView from 'app/js/views/share_summary_view';
import HierarchicalListView from 'app/js/views/hierarchical_list_view';

export default class ProximityAppsController extends Controller {
  constructor() {
    this.shareSummaryView = new ShareSummaryView();
    this.shareSummaryView.init(this);
    this.proximityAppsView = new HierarchicalListView({
      id: 'proximity-apps',
      title: 'Available apps',
      type: 'download'
    });
    this.proximityAppsView.init(this);
    this.proximityAddonsView = new HierarchicalListView({
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
    this.proximityAppsView.render(P2pService.instance.proximityApps);
    this.proximityAddonsView.render(P2pService.instance.proximityAddons);
  }

  handleControlClick(e) {
    var appName = e.target.dataset.app;
    P2pService.instance.downloadApp(appName);
  }

  handleDescriptionClick(e) {
    // In case the tap hit a child node of the <div> element with the data-app
    // attribute set.
    var appName = e.target.dataset.app || e.target.parentNode.dataset.app;
    window.location.hash = 'app';
    window.history.pushState(appName, appName);
  }

  openSharePanel() {
    window.location.hash = 'share';
  }
}
