import { Controller } from 'fxos-mvc/dist/mvc';

import DeviceNameService from 'app/js/services/device_name_service';

import DeviceNameView from 'app/js/views/device_name_view';

export default class DeviceNameController extends Controller {
  constructor() {
    this.view = new DeviceNameView();
  }

  main() {
    this.view.render();
    document.body.appendChild(this.view.el);

    setTimeout(() => {
      this.view.open();

      DeviceNameService.instance.getDeviceName().then((deviceName) => {
        console.log('setting to ' + deviceName);
        this.view.value = deviceName;
      });
    });
  }
}
