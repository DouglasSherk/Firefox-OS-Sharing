import { View } from 'fxos-mvc/dist/mvc';
import 'gaia-header/dist/gaia-header';
import 'gaia-icons/gaia-icons';

export default class MainView extends View {
  template() {
    var string = `
      <gaia-header id="sharing-header" action="back">
        <h1>P2P Sharing</h1>
      </gaia-header>`;

    return string;
  }

  render() {
    super();

    var backButton = document.getElementById('sharing-header');
    backButton.addEventListener('action', this._handleAction.bind(this));
  }

  _handleAction(e) {
    if (e.detail.type !== 'back') {
      return;
    }

    this.controller.handleBack();
  }
}
