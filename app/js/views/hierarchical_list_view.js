import ListView from 'app/js/views/list_view';

import 'gaia-loading/gaia-loading';

export default class HierarchicalListView extends ListView {
  constructor(options) {
    super(options);
  }

  template(peer) {
    var loading =
      peer.apps.length ? '' : '<gaia-loading></gaia-loading>';
    var string = `
    <li tabindex="0" class="subheading">
      <p>${peer.name}</p> ${loading}
    </li>`;

    if (peer.apps) {
      for (var i = 0; i < peer.apps.length; i++) {
        var app = peer.apps[i];
        string += super(app);
      }
    }
    return string;
  }
}
