import /* global DNSSD, IPUtils */ 'dns-sd.js/dist/dns-sd';

import { Service } from 'fxos-mvc/dist/mvc';

import HttpServerService from 'app/js/services/http_server_service';
import HttpClientService from 'app/js/services/http_client_service';

// Enable this if you want the device to pretend that it's connected to another
// device and request its own apps.
window.TEST_MODE = false;

var singletonGuard = {};
var instance;

export default class P2pService extends Service {
  constructor(guard) {
    if (guard !== singletonGuard) {
      console.error('Cannot create singleton class');
      return;
    }

    if (window.TEST_MODE) {
      window.p2p = this;
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

    /*
    setTimeout(() => {
      this._updatePeerInfo('127.0.0.1', {name: '', apps: [
        {manifest: {name: 'Sharing', description: 'doo', origin: 'abc',
         developer: {name: 'Dougiashdfihajksdhfkashdfkjhkasjhdfasdffd'}}},
        {manifest: {name: 'HelloWorld', description: 'too', origin: 'def',
         developer: {name: 'Hammasjdjkfhakshdfjkhaskjd'}}},
        {manifest: {name: 'Rail Rush', description: 'game', origin: 'ghi',
         developer: {name: 'Gamer'}}},
        {manifest: {name: 'test', description: 'ham', origin: 'jkl',
         developer: {name: 'abcabcacbasdasdasd'}}}]});
    }, 2000);

    setTimeout(() => {
      this._updatePeerInfo('192.168.100.100', {name: 'garbage', apps: []});
    }, 4000);
    */

    /*if (window.TEST_MODE) {
      setTimeout(() => {
        this._addPeer('127.0.0.1');
      }, 2000);
    }*/

    this._enableP2pConnection();

    this._ipAddresses = new Promise((resolve, reject) => {
      IPUtils.getAddresses((ipAddress) => {
        // XXX/drs: This will break if we have multiple IP addresses.
        resolve([ipAddress]);
      });
    });
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
    function searchForProximityApp(apps) {
      var proximityApp;
      for (var index in apps) {
        var peer = apps[index];

        proximityApp = peer.apps.find((app) => {
          for (var filter in filters) {
            if (app.manifest[filter] === filters[filter]) {
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

    var retval = searchForProximityApp(this._proximityApps) ||
                 searchForProximityApp(this._proximityAddons) ||
                 searchForProximityApp(this._proximityTheme);
    return retval;
  }

  _broadcastLoaded(val) {
    this._broadcast = val;
    if (this._broadcast) {
      HttpServerService.instance.activate();
    } else {
      HttpServerService.instance.deactivate();
    }
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
    }, 10000);
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
}
