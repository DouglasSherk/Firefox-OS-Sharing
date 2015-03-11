import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-button/gaia-button';

export default class AppView extends View {
  constructor() {
    this.el = document.createElement('div');
    this.el.id = 'app-view';

    this.render();
  }

  template() {
    var string = `
      <gaia-list class="app-list">
        <li>
          <img></img>
          <div class="description">
            <h3></h3>
            <h4></h4>
          </div>
          <gaia-button class="control primary" data-action="download">
            <span></span>
          </gaia-button>
        </li>
      </gaia-list>
      <p></p>
    `;
    return string;
  }

  render() {
    super();

    setTimeout(() => {
      this.on('click', 'gaia-button');

      this.els = {};
      this.els.icon = this.$('img');
      this.els.name = this.$('h3');
      this.els.owner = this.$('h4');
      this.els.description = this.$('p');
      this.els.button = this.$('gaia-button[data-action="download"]');
      this.els.buttonText = this.els.button.querySelector('span');
    });
  }

  show(app) {
    if (!app) {
      // If we reload the app while the hash is pointed to this view, we won't
      // have any apps to display, so let's just go back to the main view.
      window.location.hash = '';
      return;
    }

    this.els.icon.src = app.icon || 'icons/default.png';
    this.els.name.textContent = app.manifest.name;
    this.els.owner.textContent =
      app.manifest.developer && app.manifest.developer.name;
    this.els.description.textContent = app.manifest.description;
    this.els.button.dataset.id = app.manifestURL;
    this.els.button.disabled = app.installed;
    this.els.buttonText.textContent = app.installed ? 'Installed' : 'Download';
  }
}
