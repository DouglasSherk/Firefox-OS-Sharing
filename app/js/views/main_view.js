import { View } from 'fxos-mvc/dist/mvc';
import 'gaia-header/dist/gaia-header';
import 'gaia-icons/gaia-icons';

export default class MainView extends View {
  template() {
    var string = `
      <gaia-header action="back" data-action="back">
        <h1 data-action="developer">P2P Sharing</h1>
      </gaia-header>`;

    return string;
  }

  render() {
    super();

    this.on('action', 'gaia-header');
    this.on('contextmenu', 'gaia-header h1');
  }
}
