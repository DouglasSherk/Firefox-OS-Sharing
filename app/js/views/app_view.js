import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-button/gaia-button';

export default class AppView extends View {
  constructor() {
    this.el = document.createElement('div');
    this.el.id = 'appView';
  }

  template() {
    var string = `
      <h1 id="appName"></h1>
      <h3 id="appOwner"></h3>
      <p id="appDescription"></p>
      <gaia-button id="appDownload">Download</gaia-button>
    `;
    return string;
  }

  render(app) {
    super();

    setTimeout(() => {
      var appNameEl = document.getElementById('appName');
      var appOwnerEl = document.getElementById('appOwner');
      var appDescriptionEl = document.getElementById('appDescription');
      var downloadButtonEl = document.getElementById('appDownload');

      appNameEl.textContent = app.manifest.name;
      appOwnerEl.textContent = 'Provided by ' + app.owner;
      appDescriptionEl.textContent = app.manifest.description;
      downloadButtonEl.dataset.app = app.manifest.name;
      downloadButtonEl.addEventListener('click', this._handleClick.bind(this));
    });
  }

  _handleClick(e) {
    this.controller._handleClick(e);
  }
}
