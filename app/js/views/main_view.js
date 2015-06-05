import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-header';
import 'gaia-icons';
import 'fxos-dev-mode-dialog';

export default class MainView extends View {
  constructor(options) {
    super(options);

    this.els = {};
    this.els.devModeDialog = document.createElement('fxos-dev-mode-dialog');
    this.el.appendChild(this.els.devModeDialog);

    this.on('action', 'gaia-header');
    this.on('contextmenu', 'gaia-header h1');
  }

  render() {

  }
}
