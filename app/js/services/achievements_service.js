'use strict';

import AchievementsService from
  'fxos-achievements-service/dist/achievements-service';
import BroadcastService from 'app/js/services/broadcast_service';

const ACHIEVEMENT_CRITERIA = 'achievements/sharing-is-caring';
const ACHIEVEMENT_EVIDENCE = 'urn:sharing:p2p_broadcast:true';

class AchievementsServiceWrapper {
  constructor() {
    // Create an achievements service
    var achievementsService = new AchievementsService();

    // When sharing is enabled, reward an achievement
    BroadcastService.addEventListener('broadcast', ({broadcast}) => {
      if (!broadcast) {
        // Do nothing if sharing is disabled
        return;
      }
      achievementsService.reward({
        criteria: ACHIEVEMENT_CRITERIA,
        evidence: ACHIEVEMENT_EVIDENCE,
        name: 'Sharing is Caring',
        description: 'Share your apps and add-ons in Sharing app.'
      });
    });
  }
}

export default new AchievementsServiceWrapper();
