import { View } from 'fxos-mvc/dist/mvc';

export default class ShareView extends View {
  constructor(options) {
    super(options);

    var header = document.createElement('gaia-header');
    header.innerHTML = `<h1>Share My Apps</h1>`;
    header.dataset.action = 'back';
    header.setAttribute('action', 'back');

    this.el = document.createElement('div');
    this.el.id = 'share-apps-container';
    this.el.appendChild(header);
    this.el.appendChild(this.controller.shareSettingsView.el);
    this.el.appendChild(this.controller.sharedAppsView.el);
    this.el.appendChild(this.controller.sharedAddonsView.el);
    this.el.appendChild(this.controller.sharedThemesView.el);
    document.body.appendChild(this.el);

    this.on('action', 'gaia-header');
  }

  render() {

  }
}
