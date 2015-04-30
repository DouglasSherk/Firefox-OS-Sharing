'use strict';

import AchievementsService from
  'fxos-achievements-service/dist/achievements-service';
import BroadcastService from 'app/js/services/broadcast_service';

const ACHIEVEMENT_CRITERIA = '/enable_sharing.html';
const EVIDENCE = 'urn:sharing:p2p_broadcast:true';

class AchievementsServiceWrapper {
  constructor() {
    // Create an achievements service
    var achievementsService = new AchievementsService();

    // Register an achievement class for enabling sharing
    achievementsService.register({
      name: 'Enable sharing',
      description: 'Share your apps, addons and themes',
      criteria: ACHIEVEMENT_CRITERIA
    });

    // When sharing is enabled, reward an achievement
    BroadcastService.addEventListener('broadcast', ({broadcast}) => {
      if (!broadcast) {
        // Do nothing if sharing is disabled
        return;
      }
      achievementsService.reward(ACHIEVEMENT_CRITERIA, EVIDENCE);
    });
  }
}

export default new AchievementsServiceWrapper();
