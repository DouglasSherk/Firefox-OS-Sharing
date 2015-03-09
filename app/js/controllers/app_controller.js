import { Controller } from 'fxos-mvc/dist/mvc';

import AppView from 'app/js/views/app_view';

import HttpClientService from 'app/js/services/http_client_service';
import P2pService from 'app/js/services/p2p_service';

export default class AppController extends Controller {
  constructor() {
    this.view = new AppView();
    this.view.init(this);
  }

  main() {
    var appName = window.history.state;

    this._app = P2pService.instance.getProximityApp({name: appName});
    this.view.render(this._app);
    document.body.appendChild(this.view.el);
  }

  teardown() {
    document.body.removeChild(this.view.el);
  }

  _handleClick(e) {
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
