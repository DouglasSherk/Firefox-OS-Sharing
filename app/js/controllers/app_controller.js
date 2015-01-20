import { Controller } from 'fxos-mvc/dist/mvc';

import AppView from 'app/js/views/app_view';

import AppsService from 'app/js/services/apps_service';
import P2pService from 'app/js/services/p2p_service';

export default class AppController extends Controller {
  constructor() {
    this.view = new AppView();
    this.view.init(this);
  }

  main() {
    var appName = window.history.state;

    AppsService.instance.findAppByName(appName).then((app) => {
      this.view.render(app);
      document.body.appendChild(this.view.el);
    });
  }

  teardown() {
    document.body.removeChild(this.view.el);
  }

  _handleClick(e) {
    var appName = e.target.dataset.app;
    P2pService.instance.downloadApp(appName);
  }
}
