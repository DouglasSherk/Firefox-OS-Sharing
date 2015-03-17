import 'app/js/globals';

import MainController from 'app/js/controllers/main_controller';

var mainController = new MainController();
mainController.main();

// Generate a pseudo-GUID for this session.
window.session = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  var r = window.crypto.getRandomValues(new Uint32Array(1))[0] % 16,
      v = c == 'x' ? r : (r&0x3|0x8);
  return v.toString(16);
});
