import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-header';
import 'gaia-icons';

export default class MainView extends View {
  template() {
    var string = `
      <gaia-header data-action="back">
        <h1 data-action="developer">P2P Sharing</h1>
      </gaia-header>`;

    return string;
  }

  render() {
    super();

    this.on('action', 'gaia-header');
    this.on('contextmenu', 'gaia-header h1');

    setTimeout(() => {
      this.els = {};
      this.els.header = this.$('gaia-header');
      this.els.headerText = this.$('gaia-header h1');
    });
  }

  setHeader(text) {
    if (!this.els || !this.els.headerText) {
      return;
    }

    if (text) {
      this.els.headerText.textContent = text;
    } else {
      this.els.headerText.textContent = 'P2P Sharing';
    }
  }

  toggleBackButton(enable) {
    if (this.els && this.els.header) {
      this.els.header.setAttribute('action', enable ? 'back' : '');
    }
  }
}
