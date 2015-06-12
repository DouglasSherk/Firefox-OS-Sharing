import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-button';

export default class AppView extends View {
  constructor(options) {
    super(options);

    this.el = document.createElement('div');
    this.el.id = 'app-view';

    this.render();
  }

  template() {
    var string = `
      <gaia-header action="close" data-action="close">
        <h1></h1>
      </gaia-header>
      <gaia-list class="app-list">
        <li>
          <img></img>
          <div flex class="description">
            <h3></h3>
            <h4></h4>
          </div>
          <gaia-button class="control">
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
      this.on('action', 'gaia-header');
      this.on('click', 'gaia-button');

      this.els = {};
      this.els.title = this.$('h1');
      this.els.icon = this.$('img');
      this.els.name = this.$('h3');
      this.els.owner = this.$('h4');
      this.els.description = this.$('p');
      this.els.button = this.$('gaia-button');
      this.els.buttonText = this.els.button.querySelector('span');
    });
  }

  show(app) {
    this.el.classList.add('active');
    this.els.icon.src = app.icon || 'icons/default.png';
    this.els.title.textContent = app.manifest.name;
    this.els.name.textContent = app.manifest.name;
    this.els.owner.textContent =
      app.manifest.developer && app.manifest.developer.name;
    this.els.description.textContent = app.manifest.description;
    this.els.button.dataset.id = app.manifestURL;
    this.els.button.dataset.action = app.installed ? 'open' : 'download';
    this.els.buttonText.textContent = app.installed ? 'Open' : 'Install';
  }

  hide() {
    this.el.classList.remove('active');
  }
}
