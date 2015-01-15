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
    var string = `<li tabindex="0"><h2>${peer.name}</h2></li>`;
    peer.apps.forEach((app) => {
      string += super(app);
    });
    return string;
  }
}
