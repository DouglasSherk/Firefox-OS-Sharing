import { Controller } from 'components/fxos-mvc/dist/mvc';

import DeviceNameView from 'js/views/device_name_view';

export default class DeviceNameController extends Controller {
  constructor() {
    this.view = new DeviceNameView();
  }

  main() {
    this.view.render();
    document.body.appendChild(this.view.el);
  }

  teardown() {
    document.body.removeChild(this.view.el);
  }
}
