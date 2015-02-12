import { Service } from 'fxos-mvc/dist/mvc';

var singletonGuard = {};
var instance;

export default class ActivityService extends Service {
  constructor(guard) {
    if (guard !== singletonGuard) {
      console.error('Cannot create singleton class');
      return;
    }

    super();

    navigator.mozSetMessageHandler('activity', (req) => {
      var option = req.source;

      if (option.name === 'share') {
        window.activityHandled = 'share';
        var app = option.data.app;
        window.alert(`Sharing ${app} is not implemented yet`);
      }
    });
  }

  static get instance() {
    if (!instance) {
      instance = new this(singletonGuard);
    }
    return instance;
  }
}
