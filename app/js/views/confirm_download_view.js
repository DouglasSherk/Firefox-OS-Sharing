import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-dialog/gaia-dialog';

export default class ConfirmDownloadView extends View {
  template() {
    var string = `
      <section>
        <img></img>
        <div>
          <h3><strong></strong></h3>
          <h4></h4>
        </div>
        <hr/>
        <p>Do you want to download and install this application?</p>
      </section>
      <fieldset>
        <button data-action="cancel">Cancel</button>
        <button class="primary" data-action="install">Install</button>
      </fieldset>
    `;
    return string;
  }

  render() {
    this.el = document.createElement('gaia-dialog');
    this.el.classList.add('install');
    this.el.addEventListener('opened', () => this._opened());
    this.el.addEventListener('closed', () => this._closed());

    super();

    setTimeout(() => {
      this._icon = this.$('img');
      this._header = this.$('h3 strong');
      this._subheader = this.$('h4');
    });
  }

  open(app) {
    this._icon.src = app.icon;
    this._header.textContent = app.manifest.name;
    this._subheader.textContent =
      (app.manifest.developer && app.manifest.developer.name) ||
      app.manifest.description;
    this.el.open();
  }

  close() {
    this.el.close();
  }

  _opened() {
    this.on('click', 'button');
  }

  _closed() {
    this.off('click', 'button');
  }
}
