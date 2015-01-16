import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-list/gaia-list';

export default class ShareSummaryView extends View {
  constructor() {
    this.el = document.createElement('gaia-list');
    this.el.id = 'sharing-summary';
    this.el.addEventListener('click', this._handleClick.bind(this));
  }

  template() {
    var string = `
      <li>
        <div>
          <h3>Share My Apps</h3>
          <h4 id="sharing-summary-status">Sharing Off</h4>
        </div>
        <i id="sharing-summary-caret" data-icon="forward-light"></i>
      </li>`;
    return string;
  }

  render() {
    super();

    setTimeout(() => {
      this.broadcastElt = document.getElementById('sharing-summary-status');
    });
  }

  displayBroadcast(enable) {
    if (this.broadcastElt) {
      this.broadcastElt.textContent = 'Sharing ' + (enable ? 'On' : 'Off');
    }
  }

  _handleClick(e) {
    this.controller.openSharePanel();
  }
}
