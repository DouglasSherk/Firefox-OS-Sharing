import { Controller } from 'fxos-mvc/dist/mvc';

export default class ConfirmDownloadController extends Controller {
  constructor(options) {
    super(options);

    this.view.render();
  }

  open(app, cb) {
    document.body.appendChild(this.view.el);
    this.view.open(app);

    this._cb = cb;
  }

  cancel() {
    this.view.close();
  }

  install() {
    this.view.close();
    this._cb();
  }
}
