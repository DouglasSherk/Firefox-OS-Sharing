import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-dialog/gaia-dialog';
import 'gaia-progress/gaia-progress';
import 'gaia-button/gaia-button';

export default class ProgressDialogView extends View {
  template() {
    var string = `
      <h1>Downloading app</h1>
      <gaia-progress></gaia-progress>
    `;
    return string;
  }

  render() {
    this.el = document.createElement('gaia-dialog');

    super();

    this.el.addEventListener(
      'closed', this.controller.teardown.bind(this.controller));
    this.el.addEventListener('touchstart', this._handleTouchStart.bind(this));
  }

  success(app) {
    this.el.innerHTML = `
      <p>Successfully downloaded ${app.manifest.name}!</p>
    `;
    this._loading = false;
  }

  error(e) {
    this.el.innerHTML = `
      <p>Error downloading app: ${e.name || ''} ${e.description || ''}</p>
      <section><gaia-button>Ok</gaia-button></section>
    `;
    this._loading = false;

    setTimeout(() => {
      var button = this.el.querySelector('gaia-button');
      button.addEventListener('click', this.close.bind(this));
    });
  }

  open(app) {
    this.el.open();
    this._loading = true;
  }

  close() {
    this.el.close();
  }

  // Don't allow closing the loading dialog.
  _handleTouchStart(e) {
    if (this._loading) {
      e.preventDefault();
    }
  }
}
