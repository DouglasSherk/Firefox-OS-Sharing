/* global Sharing */

import { Controller } from 'fxos-mvc/dist/mvc';

import App from 'app/js/models/app';

import AppsService from 'app/js/services/apps_service';
import HttpClientService from 'app/js/services/http_client_service';
import P2pService from 'app/js/services/p2p_service';

export default class AppController extends Controller {
  constructor(options) {
    super(options);

    this._appsUpdated = () => this.main();

    document.body.appendChild(this.view.el);
  }

  main(appId) {
    var proxApps = P2pService.getApps();

    this._app = App.getApp(proxApps, {manifestURL: appId});
    this.header = this._app && this._app.manifest.name;

    AppsService.getApps().then(installedApps => {
      this._app = App.markInstalledApps(installedApps, [this._app])[0];
      this.view.show(this._app);
      AppsService.addEventListener('updated', this._appsUpdated);
    });
  }

  teardown() {
    this.view.hide();
    AppsService.removeEventListener('updated', this._appsUpdated);
  }

  close() {
    this.teardown();
  }

  download(e) {
    Sharing.ConfirmDownloadController.open(this._app, () => {
      var progressDialogController = Sharing.ProgressDialogController;

      progressDialogController.main();

      HttpClientService.downloadApp(this._app).then(
        progressDialogController.success.bind(progressDialogController),
        progressDialogController.error.bind(progressDialogController));
    });
  }

  open() {
    navigator.mozApps.mgmt.getAll().then(apps => {
      apps.forEach(app => {
        if (app.manifestURL === this._app.manifestURL) {
          app.launch();
        }
      });
    });
  }
}
