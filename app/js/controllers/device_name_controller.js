import { Controller } from 'fxos-mvc/dist/mvc';

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
    });
  }
}
