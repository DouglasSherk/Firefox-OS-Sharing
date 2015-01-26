import { Controller } from 'fxos-mvc/dist/mvc';

import AppView from 'app/js/views/app_view';

import
  ProgressDialogController from 'app/js/controllers/progress_dialog_controller';

import HttpClientService from 'app/js/services/http_client_service';
import P2pService from 'app/js/services/p2p_service';

export default class AppController extends Controller {
  constructor() {
    this.view = new AppView();
    this.view.init(this);

    this.progressDialogController = new ProgressDialogController();
  }

  main() {
    var appName = window.history.state;

    var app = P2pService.instance.getProximityApp(appName);
    this.view.render(app);
    document.body.appendChild(this.view.el);
  }

  teardown() {
    document.body.removeChild(this.view.el);
  }

  _handleClick(e) {
    var url = e.target.dataset.url;
    this.progressDialogController.main();
    HttpClientService.instance.downloadApp(url).then(
      this.progressDialogController.success.bind(this.progressDialogController),
      this.progressDialogController.error.bind(this.progressDialogController));
  }
}
