import { RoutingController } from 'fxos-mvc/dist/mvc';

import MainView from 'app/js/views/main_view';

import ProximityAppsController from 'app/js/controllers/proximity_apps_controller';
import ShareController from 'app/js/controllers/share_controller';
import AppController from 'app/js/controllers/app_controller';

import ActivityService from 'app/js/services/activity_service';

export default class MainController extends RoutingController {
  constructor() {
    this.view = new MainView({ el: document.body });

    super({
      '': new ProximityAppsController(),
      'share': new ShareController(),
      'app': new AppController()
    });

    var stub = function() {};
    stub(ActivityService.instance);
  }

  main() {
    this.view.render();
    super();
    this.route();
    document.documentElement.classList.remove('loading');
  }

  handleBack() {
    if (window.location.hash === '' && window.activityHandled) {
      window.close();
    }

    window.location.hash = '';
  }
}
