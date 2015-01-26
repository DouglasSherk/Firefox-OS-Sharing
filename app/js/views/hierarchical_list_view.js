import ListView from 'app/js/views/list_view';

export default class HierarchicalListView extends ListView {
  constructor(options) {
    super(options);
  }

  template(peer) {
    var string = '';
    if (peer[this.attr] && peer[this.attr].length) {
      string = `
        <li tabindex="0" class="subheading">
          <p>${peer.name}</p>
        </li>`;

      for (var i = 0; i < peer[this.attr].length; i++) {
        var app = peer[this.attr][i];
        string += super(app);
      }
    }
    return string;
  }
}
