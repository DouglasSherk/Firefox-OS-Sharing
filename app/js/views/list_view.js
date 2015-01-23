import { View } from 'fxos-mvc/dist/mvc';

import HttpService from 'app/js/services/http_service';

import 'gaia-list/gaia-list';
import 'gaia-checkbox/gaia-checkbox';

export default class ListView extends View {
  constructor(options) {
    this.el = document.createElement('gaia-list');
    this.el.id = options.id;
    this.el.classList.add('app-list');
    if (options.disabled) {
      this.el.setAttribute('disabled', true);
    }

    this.title = options.title;
    this.type = options.type;
  }

  layout(template) {
    return `<h1>${this.title}</h1>${template}`;
  }

  template(app) {
    var string = `
      <li tabindex="0">
        <div class="description" data-app="${app.manifest.name}">
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
        control.addEventListener('click', this._handleControlClick.bind(this));
      }

      // Bind click listeners to the description region if displaying a download
      // list.
      if (this.type === 'download') {
        var descriptions = this.$$('.description');
        for (i = 0; i < descriptions.length; i++) {
          var description = descriptions[i];
          description.addEventListener(
            'click', this._handleDescriptionClick.bind(this));
        }
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
      var url = HttpService.instance.getAppDownloadUrl(app);
      var string = `
        <a data-url="${url}" class="control">
          Download
        </a>`;
      return string;
    }
  }

  _handleControlClick(e) {
    this.controller.handleControlClick(e);
  }

  _handleDescriptionClick(e) {
    this.controller.handleDescriptionClick(e);
  }
}
