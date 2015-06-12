/* global Sharing */

import { Controller } from 'fxos-mvc/dist/mvc';

import App from 'app/js/models/app';

import AppsService from 'app/js/services/apps_service';
import BroadcastService from 'app/js/services/broadcast_service';
import DeviceNameService from 'app/js/services/device_name_service';
import ShareService from 'app/js/services/share_service';

import ShareSettingsView from 'app/js/views/share_settings_view';
import ListView from 'app/js/views/list_view';

import CompositeTemplate from 'app/js/views/templates/composite';

export default class ShareController extends Controller {
  constructor() {
    this.shareSettingsView = new ShareSettingsView({
      controller: this
    });
    this.sharedAppsView = new ListView({
      controller: this,
      id: 'shared-apps',
      title: 'My apps',
      type: 'toggle',
      disabled: true
    });
    this.sharedAddonsView = new ListView({
      controller: this,
      id: 'shared-addons',
      title: 'My add-ons',
      type: 'toggle',
      disabled: true
    });
    this.sharedThemesView = new ListView({
      controller: this,
      id: 'shared-themes',
      title: 'My themes',
      type: 'toggle',
      disabled: true
    });
    this.view = new CompositeTemplate({
      controller: this,
      header: {
        title: 'Share My Apps',
        action: 'back'
      },
      id: 'share-apps-container',
      views: [
        this.shareSettingsView,
        this.sharedAppsView,
        this.sharedAddonsView,
        this.sharedThemesView
      ]
    });

    BroadcastService.addEventListener(
      'broadcast', e => this._broadcastChanged(e), true);

    DeviceNameService.addEventListener(
      'devicenamechange', e => this._deviceNameChanged(e), true);

    DeviceNameService.addEventListener(
      'devicenamechange-cancel', () => this.back());

    AppsService.addEventListener('updated', () => this._appsChanged(), true);

    DeviceNameService.getDeviceName().then(deviceName => {
      this._deviceNameChanged({deviceName: deviceName});
    });
  }

  main() {
    this.view.el.classList.add('active');

    if (DeviceNameService.isDefault()) {
      Sharing.DeviceNameController.main();
    }
  }

  teardown() {
    this.view.el.classList.remove('active');
  }

  _appsChanged() {
    // We want to fetch all of our apps, even if we're not broadcasting them, so
    // that we can show them greyed out.
    var options = { ignoreBroadcast: true };

    Promise.all([AppsService.getApps(), ShareService.getApps(options)]).then(
    results => {
      var installedApps = results[0];
      var sharedApps = results[1];
      var apps = App.markSharedApps(sharedApps, installedApps);

      this.sharedAppsView.render(App.filterApps(apps));
      this.sharedAddonsView.render(App.filterAddons(apps));
      this.sharedThemesView.render(App.filterThemes(apps));
    });
  }

  toggleBroadcasting(toggle) {
    BroadcastService.setBroadcast(toggle);
  }

  _broadcastChanged(e) {
    var broadcast = e.broadcast;
    this.shareSettingsView.displayBroadcast(broadcast);
    this.sharedAppsView.toggle(!broadcast);
    this.sharedAddonsView.toggle(!broadcast);
    this.sharedThemesView.toggle(!broadcast);
  }

  _deviceNameChanged(e) {
    this.shareSettingsView.deviceName = e.deviceName;
  }

  back() {
    this.teardown();
    Sharing.ProximityAppsController.main();
  }

  toggle(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    var el = e.target.querySelector('.control') || e.target;
    var checked = el.checked;

    AppsService.getApps().then(apps => {
      var app = App.getApp(apps, {manifestURL: el.dataset.id});

      ShareService.setAppShare(app, !checked);

      // If there's a .control element under this one, then the user must have
      // tapped on the description.
      if (e.target.querySelector('.control')) {
        el.toggle();
      }
    });
  }

  description(e) {
    this.toggle({target: e.target.parentNode});
  }

  rename() {
    Sharing.DeviceNameController.main();
  }
}
