import { View } from 'fxos-mvc/dist/mvc';

/**
 * Helper view for combining multiple views into one. All it does is composite
 * them together into a single element.
 */
export default class CompositeTemplate extends View {
  constructor(options) {
    super(options);

    this.el = document.createElement('div');
    this.el.id = options.id;
    if (options.active) {
      this.el.classList.add('active');
    }

    if (options.header) {
      var header = document.createElement('gaia-header');
      header.innerHTML = `<h1>${options.header.title}</h1>`;
      if (options.header.action) {
        header.setAttribute('action', options.header.action);
        header.dataset.action = options.header.action;
        this.on('action', 'gaia-header');
      }
      this.el.appendChild(header);
    }

    options.views.forEach(view => {
      this.el.appendChild(view.el);
    });

    document.body.appendChild(this.el);
  }

  render() {

  }
}
