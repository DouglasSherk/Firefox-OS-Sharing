/* global Sharing */

import { Controller } from 'fxos-mvc/dist/mvc';

import App from 'app/js/models/app';

import AppsService from 'app/js/services/apps_service';
import BroadcastService from 'app/js/services/broadcast_service';
import HttpClientService from 'app/js/services/http_client_service';
import P2pService from 'app/js/services/p2p_service';
import WifiService from 'app/js/services/wifi_service';

import ShareSummaryView from 'app/js/views/share_summary_view';
import ListView from 'app/js/views/list_view';
import ProximityEmptyView from 'app/js/views/proximity_empty_view';

import CompositeTemplate from 'app/js/views/templates/composite';

export default class ProximityAppsController extends Controller {
  constructor() {
    this.shareSummaryView = new ShareSummaryView({
      controller: this
    });
    this.proximityEmptyView = new ProximityEmptyView({
      controller: this
    });
    this.proximityAppsView = new ListView({
      controller: this,
      id: 'proximity-apps',
      title: 'Available apps',
      type: 'download',
      attr: 'apps'
    });
    this.proximityAddonsView = new ListView({
      controller: this,
      id: 'proximity-addons',
      title: 'Available add-ons',
      type: 'download',
      attr: 'addons'
    });
    this.proximityThemesView = new ListView({
      controller: this,
      id: 'proximity-themes',
      title: 'Available themes',
      type: 'download',
      attr: 'themes'
    });
    this.marketplacesView = new ListView({
      controller: this,
      id: 'marketplaces',
      title: 'Marketplaces',
      type: 'link',
      attr: 'marketplaces'
    });
    this.view = new CompositeTemplate({
      controller: this,
      header: {
        title: 'P2P Sharing'
      },
      active: true,
      id: 'proximity-apps-container',
      views: [
        this.shareSummaryView,
        this.proximityEmptyView,
        this.proximityAppsView,
        this.proximityAddonsView,
        this.proximityThemesView,
        this.marketplacesView
      ]
    });

    BroadcastService.addEventListener(
      'broadcast', e => this._broadcastChanged(e), true);

    P2pService.addEventListener(
      'proximity', () => this._renderList(), true);

    AppsService.addEventListener(
      'updated', () => this._renderList(), true);

    WifiService.addEventListener('statuschange', () => this._renderList());

    this._renderList();
  }

  main() {
    this.view.el.classList.add('active');
  }

  teardown() {
    this.view.el.classList.remove('active');
  }

  download(e) {
    var id = e.target.dataset.id;
    var apps = P2pService.getApps();
    var app = App.getApp(apps, {manifestURL: id});

    Sharing.ConfirmDownloadController.open(app, () => {
      var progressDialogController = Sharing.ProgressDialogController;

      progressDialogController.main();

      HttpClientService.downloadApp(app).then(
        progressDialogController.success.bind(progressDialogController),
        progressDialogController.error.bind(progressDialogController));
    });
  }

  open(e) {
    var id = e.target.dataset.id;
    navigator.mozApps.mgmt.getAll().then(apps => {
      apps.forEach(app => {
        if (app.manifestURL === id) {
          app.launch();
        }
      });
    });
  }

  description(e) {
    // In case the tap hit a child node of the <div> element with the data-id
    // attribute set.
    var appId = e.target.dataset.id || e.target.parentNode.dataset.id;
    var list = e.target.closest('.app-list');
    if (list.classList.contains('link')) {
      this.open(e);
    } else {
      Sharing.AppController.main(appId);
    }
  }

  openSharePanel() {
    this.teardown();
    Sharing.ShareController.main();
  }

  _broadcastChanged(e) {
    this.shareSummaryView.displayBroadcast(e.broadcast);
  }

  _renderList() {
    var proxApps = P2pService.getApps();

    AppsService.getApps(true /* include defaults */).then(installedApps => {
      var apps = App.filterApps(proxApps);
      var addons = App.filterAddons(proxApps);
      var themes = App.filterThemes(proxApps);
      var marketplaces = App.filterMarketplaces(installedApps);

      var proximityEmpty =
        apps.length === 0 && addons.length === 0 && themes.length === 0;
      var noNetwork = !WifiService.isConnected();
      this.proximityEmptyView.render();
      this.proximityEmptyView.show({
        proximityEmpty: proximityEmpty,
        noNetwork: noNetwork
      });

      this.proximityAppsView.render(
        App.markInstalledApps(installedApps, apps));

      this.proximityAddonsView.render(
        App.markInstalledApps(installedApps, addons));

      this.proximityThemesView.render(
        App.markInstalledApps(installedApps, themes));

      this.marketplacesView.render(marketplaces);
    });
  }
}
