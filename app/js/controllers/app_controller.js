import { Controller } from 'fxos-mvc/dist/mvc';

import App from 'app/js/models/app';

import AppsService from 'app/js/services/apps_service';
import HttpClientService from 'app/js/services/http_client_service';
import P2pService from 'app/js/services/p2p_service';

export default class AppController extends Controller {
  constructor(options) {
    super(options);

    this._appsUpdated = () => this.main();
  }

  main() {
    var appId = window.history.state;

    var proxApps = P2pService.getApps();

    this._app = App.getApp(proxApps, {manifestURL: appId});
    this.header = this._app && this._app.manifest.name;

    AppsService.instance.getApps().then(installedApps => {
      this._app = App.markInstalledApps(installedApps, [this._app])[0];
      this._show();
    });
  }

  _show() {
    this.view.show(this._app);
    document.body.appendChild(this.view.el);

    AppsService.instance.addEventListener('updated', this._appsUpdated);
  }

  teardown() {
    document.body.removeChild(this.view.el);

    AppsService.instance.removeEventListener('updated', this._appsUpdated);
  }

  download(e) {
    var confirmDownloadController =
      window.routingController.controller('confirm_download');
    confirmDownloadController.open(this._app, () => {
      var progressDialogController =
        window.routingController.controller('progress_dialog');
      progressDialogController.main();

      HttpClientService.downloadApp(this._app).then(
        progressDialogController.success.bind(progressDialogController),
        progressDialogController.error.bind(progressDialogController));
    });
  }
}
