import { View } from 'fxos-mvc/dist/mvc';

export default class ProximityAppsView extends View {
  constructor(options) {
    super(options);

    var header = document.createElement('gaia-header');
    header.innerHTML = `<h1>P2P Sharing</h1>`;

    this.el = document.createElement('div');
    this.el.id = 'proximity-apps-container';
    this.el.classList.add('active');
    this.el.appendChild(header);
    this.el.appendChild(this.controller.shareSummaryView.el);
    this.el.appendChild(this.controller.proximityEmptyView.el);
    this.el.appendChild(this.controller.proximityAppsView.el);
    this.el.appendChild(this.controller.proximityAddonsView.el);
    this.el.appendChild(this.controller.proximityThemesView.el);
    document.body.appendChild(this.el);
  }

  render() {

  }
}
