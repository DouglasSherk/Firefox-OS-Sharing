import ListView from 'js/views/list_view';

export default class HierarchicalListView extends ListView {
  constructor(options) {
    super(options);
  }

  render(params) {
    super(params);

    console.log('rendering ' + JSON.stringify(params));
  }

  template(peer) {
    console.log('templating ' + JSON.stringify(peer));
    var string = `<li tabindex="0" class="subheading">${peer.name}</li>`;
    if (peer.apps) {
      peer.apps.forEach((app) => {
        string += super(app);
      });
    }
    return string;
  }
}
