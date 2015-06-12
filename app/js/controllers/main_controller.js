import { Controller } from 'fxos-mvc/dist/mvc';

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
import ProgressDialogView from 'app/js/views/progress_dialog_view';

import /* ActivityService from */ 'app/js/services/activity_service';
import /* AchievementsService from */ 'app/js/services/achievements_service';

export default class MainController extends Controller {
  constructor() {
    super();

    this.view = new MainView({
      controller: this,
      el: document.body
    });

    window.Sharing = {
      'AppController': new AppController({view: new AppView()}),
      'ConfirmDownloadController':
        new ConfirmDownloadController({view: new ConfirmDownloadView()}),
      'DeviceNameController':
        new DeviceNameController({view: new DeviceNameView()}),
      'ProgressDialogController':
        new ProgressDialogController({view: new ProgressDialogView()}),
      'ProximityAppsController': new ProximityAppsController(),
      'ShareController': new ShareController()
    };

    window.requestAnimationFrame(() => {
      document.documentElement.classList.remove('loading');
    });
  }
}
