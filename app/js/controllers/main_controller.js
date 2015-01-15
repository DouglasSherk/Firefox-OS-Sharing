import { RoutingController } from 'components/fxos-mvc/dist/mvc';

import MainView from 'js/views/main_view';

import ProximityAppsController from 'js/controllers/proximity_apps_controller';
import ShareController from 'js/controllers/share_controller';
import DeviceNameController from 'js/controllers/device_name_controller';

import 'components/p2p/fxos-web-server.js';
import 'components/p2p/p2p_helper.js';

export default class MainController extends RoutingController {
  constructor() {
    this.view = new MainView({ el: document.body });

    super({
      '': new ProximityAppsController(),
      'share': new ShareController(),
      'device_name': new DeviceNameController()
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
