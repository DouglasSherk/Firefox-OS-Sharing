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

    var app = P2pService.instance.getProximityApp(appName);
    this.view.render(app);
    document.body.appendChild(this.view.el);
  }

  teardown() {
    document.body.removeChild(this.view.el);
  }

  _handleClick(e) {
    var url = e.target.dataset.url;
    HttpClientService.instance.downloadApp(url);
  }
}
