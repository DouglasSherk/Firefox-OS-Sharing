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

import AppView from 'app/js/views/app_view';
import ConfirmDownloadView from 'app/js/views/confirm_download_view';
import DeviceNameView from 'app/js/views/device_name_view';

import /* ActivityService from */ 'app/js/services/activity_service';
import P2pService from 'app/js/services/p2p_service';

export default class MainController extends RoutingController {
  constructor() {
    this.view = new MainView({ el: document.body });

    var indexController = new ProximityAppsController();

    super({
      '': indexController,
      'app': new AppController({
        view: new AppView()
      }),
      'confirm_download': new ConfirmDownloadController({
        view: new ConfirmDownloadView()
      }),
      'device_name': new DeviceNameController({
        view: new DeviceNameView()
      }),
      'proximity_apps': indexController,
      'progress_dialog': new ProgressDialogController(),
      'share': new ShareController()
    });
  }

  main() {
    this.view.render();
    super();
    this.route();
    document.documentElement.classList.remove('loading');
  }

  route() {
    super();
    setTimeout(() => {
      this.view.setHeader(this.activeController.header);
      this.view.toggleBackButton(
        this.activeController !== this._controllers['']);
    });
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
    P2pService.insertFakeData();
  }
}
