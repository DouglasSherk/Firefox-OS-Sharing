import /* global DNSSD, IPUtils */ 'dns-sd.js/dist/dns-sd';

import { Service } from 'fxos-mvc/dist/mvc';

import AppsService from 'app/js/services/apps_service';
import DeviceNameService from 'app/js/services/device_name_service';
import HttpClientService from 'app/js/services/http_client_service';
import HttpServerService from 'app/js/services/http_server_service';
import IconService from 'app/js/services/icon_service';

var singletonGuard = {};
var instance;

export default class P2pService extends Service {
  constructor(guard) {
    if (guard !== singletonGuard) {
      console.error('Cannot create singleton class');
      return;
    }

    super();

    this._initialized = new Promise((resolve, reject) => {
      navigator.mozSettings.addObserver('lightsaber.p2p_broadcast', (e) => {
        this._broadcastLoaded(e.settingValue);
      });

      var broadcastSetting = navigator.mozSettings.createLock().get(
        'lightsaber.p2p_broadcast', false);

      broadcastSetting.onsuccess = () => {
        this._broadcastLoaded(
          broadcastSetting.result['lightsaber.p2p_broadcast']);
        resolve();
      };

      broadcastSetting.onerror = () => {
        console.error('error getting `lightsaber.p2p_broadcast` setting');
        reject();
      };
    });

    this._proximityApps = [];
    this._proximityAddons = [];
    this._proximityThemes = [];

    this._ipAddresses = new Promise((resolve, reject) => {
      IPUtils.getAddresses((ipAddress) => {
        // XXX/drs: This will break if we have multiple IP addresses.
        resolve([ipAddress]);
      });
    });

    this._enableP2pConnection();

    window.addEventListener(
      'visibilitychange', () => this._enableP2pConnection());
  }

  static get instance() {
    if (!instance) {
      instance = new this(singletonGuard);
    }
    return instance;
  }

  get broadcast() {
    return this._broadcast;
  }

  set broadcast(enable) {
    navigator.mozSettings.createLock().set({
     'lightsaber.p2p_broadcast': enable});
  }

  getProximityApps() {
    return this._proximityApps;
  }

  getProximityAddons() {
    return this._proximityAddons;
  }

  getProximityThemes() {
    return this._proximityThemes;
  }

  getProximityApp(filters) {
    function searchForProximityApp(apps, prop) {
      var proximityApp;
      for (var index in apps) {
        var peer = apps[index];

        proximityApp = peer[prop].find((app) => {
          for (var filter in filters) {
            if (app[filter] === filters[filter] ||
                app.manifest[filter] === filters[filter]) {
              return true;
            }
          }
          return false;
        });

        if (proximityApp) {
          break;
        }
      }
      return proximityApp;
    }

    var retval = searchForProximityApp(this._proximityApps, 'apps') ||
                 searchForProximityApp(this._proximityAddons, 'addons') ||
                 searchForProximityApp(this._proximityThemes, 'themes');
    return retval;
  }

  refreshPeers() {
    DNSSD.startDiscovery();
  }

  _broadcastLoaded(val) {
    this._broadcast = val;
    this._dispatchEvent('broadcast');
  }

  _enableP2pConnection() {
    DNSSD.registerService('_fxos-sharing._tcp.local', 8080, {});

    DNSSD.addEventListener('discovered', (e) => {
      var isSharingPeer = e.services.find((service) => {
        return service === '_fxos-sharing._tcp.local';
      });

      if (!isSharingPeer) {
        return;
      }

      var address = e.address;

      this._ipAddresses.then((ipAddresses) => {
        // Make sure we're not trying to connect to ourself.
        if (ipAddresses.indexOf(address) !== -1) {
          return;
        }

        HttpClientService.instance.requestPeerInfo(address).then((peer) => {
          this._updatePeerInfo(address, peer);
        });
      });
    });

    DNSSD.startDiscovery();
    setInterval(() => {
      DNSSD.startDiscovery();
    }, 300000 /* every 5 minutes */);

    /**
     * XXX/drs: Why do we have to do this? We should be able to just get this
     * from HttpServerService, but it keeps getting 'P2pService undefined'
     * errors when this reference is made.
     */
    HttpServerService.instance.broadcast = () => {
      return this._broadcast;
    };

    // When we receive a notification from a peer that their app list has
    // changed, we should request the app list again.
    //
    // We could have made apps send their app lists instead, but the retrieval
    // mechanism was designed when we were using WiFi Direct, where a pull model
    // made more sense.
    HttpServerService.instance.addEventListener('refresh', (e) => {
      var peer = this._getPeer(e.peerName);
      HttpClientService.instance.requestPeerInfo(peer.address).then((peer) => {
        this._updatePeerInfo(peer.address, peer);
      });
    });

    // XXX/drs: We should really switch to a push model for all acquiring of app
    // lists. This is really gross.
    AppsService.instance.addEventListener('updated', () => {
      var deviceName = DeviceNameService.instance.deviceName;
      if (!deviceName) {
        return;
      }

      var peerAddresses = [];
      [this._proximityApps, this._proximityAddons,
       this._proximityThemes].forEach((apps) => {
        for (var address in apps) {
          if (peerAddresses.indexOf(address) === -1) {
            peerAddresses.push(address);
          }
        }
      });

      peerAddresses.forEach(peerAddress =>
        HttpClientService.instance.notifyPeerInfoUpdated(
          peerAddress, deviceName));
    });
  }

  _getPeer(peerName) {
    var searchAppListForPeer = (apps) => {
      for (var address in apps) {
        var peer = apps[address];
        if (peer.name === peerName) {
          return peer;
        }
      }
      return null;
    };

    return searchAppListForPeer(this._proximityApps) ||
           searchAppListForPeer(this._proximityAddons) ||
           searchAppListForPeer(this._proximityThemes);
  }

  _updatePeerInfo(address, peer) {
    peer.address = address;
    if (peer.apps !== undefined) {
      this._proximityApps[address] = peer;
    } else {
      delete this._proximityApps[address];
    }
    if (peer.addons !== undefined) {
      this._proximityAddons[address] = peer;
    } else {
      delete this._proximityAddons[address];
    }
    if (peer.themes !== undefined) {
      this._proximityThemes[address] = peer;
    } else {
      delete this._proximityThemes[address];
    }
    this._dispatchEvent('proximity');
  }

  /**
   * Debug tool. Used only to insert fake data for testing.
   */
  insertFakeData() {
    var icons = IconService.instance.icons;

    setTimeout(() => {
      this._updatePeerInfo('127.0.0.1', {name: '', apps: [{
        manifestURL: 'abc',
        icon: icons[0],
        manifest: {
          name: 'Sharing',
          description: 'doo',
          developer: {
            name: 'Dougiashdfihajksdhfkashdfkjhkasjhdfasdffd'
          }
        },
      }, {
        manifestURL: 'def',
        icon: icons[1],
        manifest: {
          name: 'HelloWorld',
          description: 'too',
          developer: {
            name: 'Hammasjdjkfhakshdfjkhaskjd'
          }
        }
      }, {
        manifestURL: 'ghi',
        icon: icons[2],
        manifest: {
          name: 'Rail Rush',
          description: 'game',
          developer: {
            name: 'Gamer'
          }
        }
      }], addons: [{
        manifestURL: 'jkl',
        icon: icons[3],
        role: 'addon',
        manifest: {
          name: 'test',
          description: 'ham',
          developer: {
            name: 'abcabcacbasdasdasd'
          }
        }
      }]});
    }, 0);

    setTimeout(() => {
      this._updatePeerInfo('192.168.100.100', {name: 'garbage', apps: []});
    }, 2000);
  }
}
