import /* global DNSSD, IPUtils */ 'dns-sd.js/dist/dns-sd';

import { Service } from 'fxos-mvc/dist/mvc';

import Peer from 'app/js/models/peer';

import AppsService from 'app/js/services/apps_service';
import DeviceNameService from 'app/js/services/device_name_service';
import HttpClientService from 'app/js/services/http_client_service';
import HttpServerService from 'app/js/services/http_server_service';
/*import IconService from 'app/js/services/icon_service';*/

class P2pService extends Service {
  constructor() {
    super();

    window.p2pService = this;

    this._peers = [];

    this._ipAddresses = new Promise((resolve, reject) => {
      IPUtils.getAddresses((ipAddress) => {
        // XXX/drs: This will break if we have multiple IP addresses.
        resolve([ipAddress]);
      });
    });

    this._enableP2pConnection();

    window.addEventListener('visibilitychange', () => DNSSD.startDiscovery());

    window.addEventListener('beforeunload', () => this._beforeUnload());

    AppsService.addEventListener('updated', () => this.sendPeersInfo());

    DeviceNameService.addEventListener(
      'devicenamechange', (/* e */) => this.sendPeersInfo());

    HttpClientService.addEventListener(
      'disconnect', e => this.receivePeerInfo({address: e.peer.address}));
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
          HttpServerService.instance.clearPeerCache(peer);
          this._peers.splice(i, 1);
          this._dispatchEvent('proximity');
          return;
        }

        if (this._peers[i].session !== peer.session) {
          Peer.getMe().then(me => this._sendPeerInfo(me, peer));
        }

        this._peers[i] = peer;
        this._dispatchEvent('proximity');
        return;
      }
    }

    this._peers.push(peer);
    this._dispatchEvent('proximity');
  }

  _sendPeerInfo(me, peer) {
    HttpClientService.sendPeerInfo(me, peer);
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

    var stub = function() {};
    stub(HttpServerService.instance);
  }

  _beforeUnload() {
    this._peers.forEach(peer => {
      HttpClientService.signalDisconnecting(peer);
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

export default new P2pService();
