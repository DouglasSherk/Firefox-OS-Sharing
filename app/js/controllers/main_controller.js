import { RoutingController } from 'fxos-mvc/dist/mvc';

import MainView from 'app/js/views/main_view';

import AppController from 'app/js/controllers/app_controller';
import ConfirmDownloadController from
  'app/js/controllers/confirm_download_controller';
import DeviceNameController from 'app/js/controllers/device_name_controller';
import ProgressDialogController from
  'app/js/controllers/progress_dialog_controller';
import ProximityAppsController from
  'app/js/controllers/proximity_apps_controller';
import ShareController from 'app/js/controllers/share_controller';

import ConfirmDownloadView from 'app/js/views/confirm_download_view';

import ActivityService from 'app/js/services/activity_service';
import P2pService from 'app/js/services/p2p_service';

export default class MainController extends RoutingController {
  constructor() {
    this.view = new MainView({ el: document.body });

    var indexController = new ProximityAppsController();

    super({
      '': indexController,
      'app': new AppController(),
      'confirm_download': new ConfirmDownloadController({
        view: new ConfirmDownloadView()
      }),
      'device_name': new DeviceNameController(),
      'proximity_apps': indexController,
      'progress_dialog': new ProgressDialogController(),
      'share': new ShareController()
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

  back(e) {
    if (e.detail.type !== 'back') {
      return;
    }

    if (window.location.hash === '' && window.activityHandled) {
      window.close();
    }

    window.location.hash = '';
  }

  developer(e) {
    P2pService.instance.insertFakeData();
  }
}
