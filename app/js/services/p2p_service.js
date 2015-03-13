import /* global DNSSD, IPUtils */ 'dns-sd.js/dist/dns-sd';

import { Service } from 'fxos-mvc/dist/mvc';

import Peer from 'app/js/models/peer';

import AppsService from 'app/js/services/apps_service';
import DeviceNameService from 'app/js/services/device_name_service';
import HttpClientService from 'app/js/services/http_client_service';
import HttpServerService from 'app/js/services/http_server_service';
/*import IconService from 'app/js/services/icon_service';*/

var singletonGuard = {};
var instance;

export default class P2pService extends Service {
  constructor(guard) {
    if (guard !== singletonGuard) {
      console.error('Cannot create singleton class');
      return;
    }

    super();

    window.p2pService = this;

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

    this._peers = [];

    this._ipAddresses = new Promise((resolve, reject) => {
      IPUtils.getAddresses((ipAddress) => {
        // XXX/drs: This will break if we have multiple IP addresses.
        resolve([ipAddress]);
      });
    });

    this._enableP2pConnection();

    window.addEventListener(
      'visibilitychange', () => DNSSD.startDiscovery());

    window.addEventListener(
      'beforeunload', () => this._beforeUnload());

    AppsService.instance.addEventListener(
      'updated', () => this.sendPeersInfo());

    DeviceNameService.instance.addEventListener(
      'devicenamechange', (e) => this.sendPeersInfo());
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

  // Reduces an array of this format:
  // [{name: 'Doug\'s Phone', apps: [{manifest: {...}}, {manifest: {...}}]},
  //  {name: 'Justin\'s Phone, apps: [{manifest: {...}}, {manifest: {...}}]},
  //  ...]
  // To:
  // [{peer: {name: 'Doug\'s Phone'}, manifest: {...}},
  //  {peer: {name: 'Doug\'s Phone'}, manifest: {...}},
  //  {peer: {name: 'Justin\'s Phone'}, manifest: {...}},
  //  {peer: {name: 'Justin\'s Phone'}, manifest: {...}},
  //  ...]
  getApps() {
    if (!this._peers.length) {
      return [];
    }

    var reduceApps = (el) => {
      var apps = el && el.apps || [];
      return apps.map(app => {
        app.peer = el;
        return app;
      });
    };

    if (this._peers.length === 1) {
      return reduceApps(this._peers[0]);
    }

    return this._peers.reduce((prev, cur) => {
      return reduceApps(prev).concat(reduceApps(cur));
    });
  }

  // Setting an address only and no other properties will delete this peer.
  receivePeerInfo(peer) {
    for (var i = 0; i < this._peers.length; i++) {
      if (this._peers[i].address === peer.address) {
        if (peer.address && Object.keys(peer).length === 1) {
          HttpClientService.instance.clearPeerCache(peer);
          this._peers.splice(i, 1);
          this._dispatchEvent('proximity');
          return;
        }

        // This peer has started a new session, so we should clear our cache so
        // that we send our peer info to them again.
        if (this._peers[i].session !== peer.session) {
          HttpClientService.instance.clearPeerCache(peer);
          Peer.getMe().then(me => this._sendPeerInfo(me, peer));
        }

        this._peers[i] = peer;
        this._dispatchEvent('proximity');
        return;
      }
    }

    HttpClientService.instance.clearPeerCache(peer);
    this._peers.push(peer);
    this._dispatchEvent('proximity');
  }

  _sendPeerInfo(me, peer) {
    HttpClientService.instance.sendPeerInfo(me, peer).then(
      // If we get an error getting this peer's information, then discard
      // the peer.
      () => {}, () => this._deletePeer(peer));
  }

  sendPeersInfo() {
    Peer.getMe().then(me =>
      this._peers.forEach(peer => this._sendPeerInfo(me, peer)));
  }

  receivePeerDisconnect(peer) {
    for (var i = 0; i < this._peers.length; i++) {
      if (this._peers[i].address === peer.address) {
        this._peers.splice(i, 1);
        this._dispatchEvent('proximity');
      }
    }
  }

  _deletePeer(peer) {
    this.receivePeerInfo({address: peer.address});
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

        var peer = {address: address};

        Peer.getMe().then(me => {
          this._sendPeerInfo(me, peer);
        });
      });
    });

    DNSSD.startDiscovery();
    setInterval(() => DNSSD.startDiscovery(), 30000 /* every 30 seconds */);
    setInterval(() => this.sendPeersInfo(), 30000 /* every 30 seconds */);

    /**
     * XXX/drs: Why do we have to do this? We should be able to just get this
     * from HttpServerService, but it keeps getting 'P2pService undefined'
     * errors when this reference is made.
     */
    HttpServerService.instance.broadcast = () => {
      return this._broadcast;
    };
  }

  _beforeUnload() {
    this._peers.forEach(peer => {
      HttpClientService.instance.signalDisconnecting(peer);
    });
  }

  /**
   * Debug tool. Used only to insert fake data for testing.
   */
  /*
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
  */
}
