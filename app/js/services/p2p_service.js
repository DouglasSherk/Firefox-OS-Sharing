import /* global DNSSD */ 'dns-sd.js/dist/dns-sd';

import { Service } from 'fxos-mvc/dist/mvc';

import HttpServerService from 'app/js/services/http_server_service';
import HttpClientService from 'app/js/services/http_client_service';

// Enable this if you want the device to pretend that it's connected to another
// device and request its own apps.
window.TEST_MODE = true;

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

    this._peers = [];

    /*
    setTimeout(() => {
      this._updatePeerInfo('127.0.0.1', {name: 'localhost', apps: [
        {manifest: {name: 'Sharing', description: 'doo'}, owner: 'Doug'},
        {manifest: {name: 'HelloWorld', description: 'too'}, owner: 'Ham'},
        {manifest: {name: 'Rail Rush', description: 'game'}, owner: 'Gamer'},
        {manifest: {name: 'test', description: 'ham'}, owner: 'Hurr'}]});
    }, 2000);

    setTimeout(() => {
      this._updatePeerInfo('192.168.100.100', {name: 'garbage', apps: []});
    }, 4000);
    */

    if (window.TEST_MODE) {
      setTimeout(() => {
        this._addPeer('127.0.0.1');
      }, 2000);
    }

    this._enableP2pConnection();
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

  get proximityApps() {
    return this._proximityApps;
  }

  get proximityAddons() {
    return this._proximityAddons;
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

      var isConnected = this._peers.find((peer) => {
        return peer === e.address;
      });

      if (!isConnected) {
        this._addPeer(e.address);
      }
    });

    DNSSD.startDiscovery();
  }

  _addPeer(address) {
    this._peers.push(address);

    HttpClientService.instance.requestPeerInfo(address).then((peer) => {
      this._updatePeerInfo(address, peer);
    });
  }

  _updatePeerInfo(address, peer) {
    if (peer.apps !== undefined) {
      peer.address = address;
      this._proximityApps[address] = peer;
    } else {
      delete this._proximityApps[address];
    }
    this._dispatchEvent('proximity');
  }
}
