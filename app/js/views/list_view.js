import { View } from 'fxos-mvc/dist/mvc';

import 'gaia-list/gaia-list';
import 'gaia-checkbox/gaia-checkbox';
import 'gaia-sub-header/gaia-sub-header';
import 'gaia-loading/gaia-loading';

export default class ListView extends View {
  constructor(options) {
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
    var loading = this.controller._everRendered ?
      '' : '<gaia-loading></gaia-loading>';
    var string = `
      <gaia-sub-header>${this.title}</gaia-sub-header>
      <gaia-list>
        ${loading}
        ${template}
      </gaia-list>`;
    return string;
  }

  render(params) {
    super(params);

    if (this.type === 'toggle') {
      this.on('click', '.app-list li');
    } else {
      this.on('click', '.app-list li *');
    }
  }

  template(app) {
    // Hack! Write this to the controller so that all categories lose the
    // loading indicator when we get any networked apps.
    this.controller._everRendered = true;

    var desc = app.peerName ||
               (app.manifest.developer && app.manifest.developer.name) ||
               app.manifest.description || 'No information available';
    var toggle = (this.type === 'toggle' && 'data-action="toggle"') || '';
    var string = `
      <li tabindex="0" ${toggle}>
        <img data-action="description" data-id="${app.manifestURL}"
         src="${app.icon}"></img>
        <div class="description" data-action="description"
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
    if (this.type === 'toggle') {
      return '<gaia-checkbox data-action="toggle" class="control">' +
             '</gaia-checkbox>';
    } else if (this.type === 'download') {
      if (app.installed) {
        return '<a class="control" disabled>Installed</a>';
      } else {
        var string = `
          <a data-id="${app.manifestURL}" data-action="download"
           class="control">
            Download
          </a>`;
        return string;
      }
    }
  }
}
