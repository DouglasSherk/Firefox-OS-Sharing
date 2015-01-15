import { View } from 'components/fxos-mvc/dist/mvc';

import 'components/gaia-list/gaia-list';
import 'components/gaia-checkbox/gaia-checkbox';

export default class ListView extends View {
  constructor(id, title, type) {
    this.el = document.createElement('gaia-list');
    this.title = title;
    this.el.id = id;
    this.el.classList.add('app-list');
    this.el.setAttribute('disabled', '');
    this.type = type;
  }

  layout(template) {
    return `<h1>${this.title}</h1>${template}`;
  }

  template(app) {
    var string = `
      <li tabindex="0">
        <div>
          <h3>${app.manifest.name}</h3>
          <h4>${app.owner || app.manifest.description}</h4>
        </div>
        ${this._control(app)}
      </li>`;
    return string;
  }

  render(params) {
    super(params);

    setTimeout(() => {
      this._controls = this.$$('.control');
      for (var i = 0; i < this._controls.length; i++) {
        var control = this._controls[i];
        control.addEventListener('click', this._handleClick.bind(this));
      }
    });
  }

  toggle(enable) {
    if (enable) {
      this.el.setAttribute('disabled', '');
    } else {
      this.el.removeAttribute('disabled');
    }
  }

  _control(app) {
    if (this.type === 'toggle') {
      return `<gaia-checkbox class="control"></gaia-checkbox>`;
    } else if (this.type === 'download') {
      var string = `
      <a data-app="${app.manifest.name}" class="control">
        Download
      </a>`;
      return string;
    }
  }

  _handleClick(e) {
    this.controller.handleClick(e);
  }
}
