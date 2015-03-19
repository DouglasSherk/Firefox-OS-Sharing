import { Service } from 'fxos-mvc/dist/mvc';

class ActivityService extends Service {
  constructor(guard) {
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
}

export default new ActivityService();
