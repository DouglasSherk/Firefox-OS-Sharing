import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-button/gaia-button';

export default class AppView extends View {
  template() {
    var string = `
      <h1 id="appName"></h1>
      <p id="appDescription"></p>
    `;
    return string;
  }

  render(app) {
    super();

    setTimeout(() => {
      var appNameEl = document.getElementById('appName');
      var appDescriptionEl = document.getElementById('appDescription');

      appNameEl.textContent = app.manifest.name;
      appDescriptionEl.textContent = app.manifest.description;
    });
  }
}
