import { Controller } from 'fxos-mvc/dist/mvc';

import App from 'app/js/models/app';

import AppsService from 'app/js/services/apps_service';
import BroadcastService from 'app/js/services/broadcast_service';
import HttpClientService from 'app/js/services/http_client_service';
import P2pService from 'app/js/services/p2p_service';

import ShareSummaryView from 'app/js/views/share_summary_view';
import ListView from 'app/js/views/list_view';

export default class ProximityAppsController extends Controller {
  constructor() {
    this.shareSummaryView = new ShareSummaryView();
    this.shareSummaryView.init(this);
    this.proximityAppsView = new ListView({
      id: 'proximity-apps',
      title: 'Available apps',
      type: 'download',
      attr: 'apps'
    });
    this.proximityAppsView.init(this);
    this.proximityAddonsView = new ListView({
      id: 'proximity-addons',
      title: 'Available add-ons',
      type: 'download',
      attr: 'addons'
    });
    this.proximityAddonsView.init(this);
    this.proximityThemesView = new ListView({
      id: 'proximity-themes',
      title: 'Available themes',
      type: 'download',
      attr: 'themes'
    });
    this.proximityThemesView.init(this);

    BroadcastService.addEventListener(
      'broadcast', e => this._broadcastChanged(e), true);

    P2pService.addEventListener(
      'proximity', () => this._proximityChanged(), true);

    AppsService.addEventListener(
      'updated', () => this._proximityChanged(), true);

    this._proximityChanged();
  }

  main() {
    document.body.appendChild(this.shareSummaryView.el);

    document.body.appendChild(this.proximityAppsView.el);
    document.body.appendChild(this.proximityAddonsView.el);
    document.body.appendChild(this.proximityThemesView.el);
  }

  teardown() {
    document.body.removeChild(this.shareSummaryView.el);

    document.body.removeChild(this.proximityAppsView.el);
    document.body.removeChild(this.proximityAddonsView.el);
    document.body.removeChild(this.proximityThemesView.el);
  }

  _broadcastChanged(e) {
    this.shareSummaryView.displayBroadcast(e.broadcast);
  }

  _proximityChanged() {
    var proxApps = P2pService.getApps();

    AppsService.getApps().then(installedApps => {
      this.proximityAppsView.render(
        App.markInstalledApps(installedApps, App.filterApps(proxApps)));

      this.proximityAddonsView.render(
        App.markInstalledApps(installedApps, App.filterAddons(proxApps)));

      this.proximityThemesView.render(
        App.markInstalledApps(installedApps, App.filterThemes(proxApps)));
    });
  }

  download(e) {
    var id = e.target.dataset.id;
    var apps = P2pService.getApps();
    var app = App.getApp(apps, {manifestURL: id});

    var confirmDownloadController =
      window.routingController.controller('confirm_download');
    confirmDownloadController.open(app, () => {
      var progressDialogController =
        window.routingController.controller('progress_dialog');
      progressDialogController.main();

      HttpClientService.downloadApp(app).then(
        progressDialogController.success.bind(progressDialogController),
        progressDialogController.error.bind(progressDialogController));
    });
  }

  description(e) {
    // In case the tap hit a child node of the <div> element with the data-app
    // attribute set.
    var appId = e.target.dataset.id || e.target.parentNode.dataset.id;
    window.location.hash = 'app';
    window.history.pushState(appId, appId);
  }

  openSharePanel() {
    window.location.hash = 'share';
  }
}
