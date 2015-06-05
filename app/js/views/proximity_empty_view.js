import { View } from 'fxos-mvc/dist/mvc';

export default class ProximityEmptyView extends View {
  constructor(options) {
    this.el = document.createElement('gaia-list');
    this.el.id = 'proximity-empty-list';

    super(options);

    this.els = {};
  }

  template() {
    var string =
      `<li class="hide"></li>
      <li id="no-network" class="hide">
        You are not currently connected to a WiFi network. Connect to one to
        discover people nearby to share with.
      </li>
      <li id="proximity-empty" class="hide">
        <div>
          No users found sharing on your WiFi network.
          <gaia-loading></gaia-loading>
        </div>
      </li>`;
    return string;
  }

  render() {
    super();

    setTimeout(() => {
      this.els.noNetwork = this.$('#no-network');
      this.els.proximityEmpty = this.$('#proximity-empty');
    });
  }

  show(params) {
    setTimeout(() => {
      this.el.classList.toggle(
        'hide', !params.noNetwork && !params.proximityEmpty);
      this.els.noNetwork.classList.toggle('hide', !params.noNetwork);
      this.els.proximityEmpty.classList.toggle(
        'hide', params.noNetwork || !params.proximityEmpty);
    });
  }
}
