import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-list';
import 'gaia-checkbox';
import 'gaia-sub-header';
import 'gaia-loading';
import 'gaia-button';

export default class ListView extends View {
  constructor(options) {
    super(options);

    this.el = document.createElement('div');
    this.el.id = options.id;
    this.el.classList.add('app-list');
    this.el.classList.add(options.type);
    if (options.disabled) {
      this.el.setAttribute('disabled', true);
    }

    this.title = options.title;
    this.type = options.type;
    this.attr = options.attr;
  }

  layout(template) {
    var string = `
      <gaia-sub-header>${this.title}</gaia-sub-header>
      <gaia-list>
        ${template}
      </gaia-list>`;
    return string;
  }

  render(params) {
    if (!params.length) {
      this.el.innerHTML = '';
      return;
    }

    super(params);

    this.on('click', '.app-list li *');
  }

  template(app) {
    var desc = (app.peer && app.peer.name) ||
               (app.manifest.developer && app.manifest.developer.name) ||
               app.manifest.description || 'No information available';
    var toggle = (this.type === 'toggle' && 'data-action="toggle"') || '';
    var string = `
      <li tabindex="0" ${toggle}>
        <img data-action="description" data-id="${app.manifestURL}"
         src="${app.icon}"></img>
        <div flex class="description" data-action="description"
         data-id="${app.manifestURL}">
          <h3>${app.manifest.name}</h3>
          <h4>${desc}</h4>
        </div>
        ${this._control(app)}
      </li>`;
    return string;
  }

  toggle(enable) {
    if (enable) {
      this.el.setAttribute('disabled', '');
    } else {
      this.el.removeAttribute('disabled');
    }
  }

  _control(app) {
    var string;
    if (this.type === 'toggle') {
      var enabled = app.shared && 'checked' || '';
      string =
        `<gaia-checkbox data-id="${app.manifestURL}" data-action="toggle"
          class="control" ${enabled}>
         </gaia-checkbox>`;
      return string;
    } else if (this.type === 'download') {
      if (app.installed) {
        string =
          `<gaia-button data-id="${app.manifestURL}" data-action="open"
           class="control">
            Open
          </gaia-button>`;
        return string;
      } else {
        string =
          `<gaia-button data-id="${app.manifestURL}" data-action="download"
           class="control">
            Install
          </gaia-button>`;
        return string;
      }
    }
  }
}
