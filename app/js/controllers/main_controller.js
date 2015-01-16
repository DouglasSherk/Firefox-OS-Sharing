import { RoutingController } from 'fxos-mvc/dist/mvc';

import MainView from 'app/js/views/main_view';

import ProximityAppsController from 'app/js/controllers/proximity_apps_controller';
import ShareController from 'app/js/controllers/share_controller';

//import 'p2p/fxos-web-server.js';
//import 'p2p/p2p_helper.js';

export default class MainController extends RoutingController {
  constructor() {
    this.view = new MainView({ el: document.body });

    super({
      '': new ProximityAppsController(),
      'share': new ShareController()
    });
  }

  main() {
    this.view.render();
    super();
    this.route();
    document.body.classList.remove('loading');
  }

  handleBack() {
    window.location.hash = '';
  }
}
