import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-list';

export default class ShareSummaryView extends View {
  constructor(options) {
    super(options);

    this.el = document.createElement('gaia-list');
    this.el.id = 'sharing-summary';
    this.el.addEventListener('click', this._handleClick.bind(this));
    this.el.classList.add('app-list');

    this.render();
  }

  template() {
    var string = `
      <li>
        <div flex>
          <h3>Share My Apps</h3>
          <h4 id="sharing-summary-status">Sharing Off</h4>
        </div>
        <i id="sharing-summary-caret" data-icon="forward-light"
         aria-hidden="true"></i>
      </li>`;
    return string;
  }

  render() {
    super();

    setTimeout(() => {
      this.broadcastElt = this.$('#sharing-summary-status');
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
