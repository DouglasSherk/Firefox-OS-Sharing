import { Controller } from 'fxos-mvc/dist/mvc';

import AppView from 'app/js/views/app_view';

import AppsService from 'app/js/services/apps_service';

export default class AppController extends Controller {
  constructor() {
    this.view = new AppView();
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
}
