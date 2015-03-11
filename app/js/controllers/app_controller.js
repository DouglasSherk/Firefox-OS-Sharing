import { Controller } from 'fxos-mvc/dist/mvc';

import AppsService from 'app/js/services/apps_service';
import HttpClientService from 'app/js/services/http_client_service';
import P2pService from 'app/js/services/p2p_service';

export default class AppController extends Controller {
  main() {
    var appId = window.history.state;

    this._app = P2pService.instance.getProximityApp({manifestURL: appId});
    this.header = this._app && this._app.manifest.name;

    AppsService.instance.getInstalledApp({manifestURL: appId}).then((app) => {
      this._app.installed = true;
      this._show();
    }, () => this._show());
  }

  _show() {
    this.view.show(this._app);
    document.body.appendChild(this.view.el);
  }

  teardown() {
    document.body.removeChild(this.view.el);
  }

  download(e) {
    var confirmDownloadController =
      window.routingController.controller('confirm_download');
    confirmDownloadController.open(this._app, () => {
      var progressDialogController =
        window.routingController.controller('progress_dialog');
      progressDialogController.main();

      HttpClientService.instance.downloadApp(this._app).then(
        progressDialogController.success.bind(progressDialogController),
        progressDialogController.error.bind(progressDialogController));
    });
  }
}
