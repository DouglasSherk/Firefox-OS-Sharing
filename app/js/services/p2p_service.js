import /* global HTTPServer */ 'components/p2p/fxos-web-server';
import /* global P2PHelper */ 'components/p2p/p2p_helper';

import AppsService from 'js/services/apps_service';

// Enable this if you want the device to pretend that it's connected to another
// device and request its own apps.
window.TEST_MODE = true;

export default class P2pService {
  constructor() {
    if (window.P2pService) {
      return window.P2pService;
    }
    window.P2pService = this;

    this._peerAddress = null;
    this._connectedIp = window.TEST_MODE ? 'http://127.0.0.1:8080' : null;

    this._broadcastListeners = [];
    this._proximityListeners = [];

    this._proximityApps = {};
    this._proximityAddons = {};

    this.appsService = new AppsService();

    this.appsService.getInstalledApps().then((apps) => {
      this._installedApps = apps;
    });

    this._initialized = new Promise((resolve, reject) => {
      navigator.mozSettings.addObserver('lightsaber.p2p_broadcast', (e) => {
        this._broadcast = e.settingValue;
        if (this._broadcast) {
          this._activateHttpServer();
        } else {
          this._deactivateHttpServer();
        }
        this._broadcastListeners.forEach((callback) => {
          callback();
        });
      });

      var broadcastSetting = navigator.mozSettings.createLock().get(
        'lightsaber.p2p_broadcast', false);

      broadcastSetting.onsuccess = () => {
        this._broadcast = broadcastSetting.result['lightsaber.p2p_broadcast'];
        if (this._broadcast) {
          this._activateHttpServer();
        } else {
          this._deactivateHttpServer();
        }
        this._broadcastListeners.forEach((callback) => {
          callback();
        });
        resolve();
      };

      broadcastSetting.onerror = () => {
        console.error('error getting `lightsaber.p2p_broadcast` setting');
        reject();
      };
    });

    window.addEventListener('visibilitychange', P2PHelper.restartScan);

    window.addEventListener(
      'beforeunload', this._deactivateHttpServer.bind(this));
  }

  addBroadcastListener(callback) {
    this._broadcastListeners.push(callback);
  }

  addProximityListener(callback) {
    this._proximityListeners.push(callback);

    setTimeout(() => {
      this._peerAddress = 'asdf';
      this._appsUpdated([
        {manifest: {name: 'Sharing', description: 'doo'}},
        {manifest: {name: 'HelloWorld', description: 'too'}},
        {manifest: {name: 'test', description: 'ham'}}]);
    }, 1000);
  }

  downloadApp(appName) {
    var apps = this.appsService.flatten(this._proximityApps);
    for (var i = 0; i < apps.length; i++) {
      var app = apps[i];
      console.log(
        'appName: ' + appName + ' / manifestName: ' + app.manifest.name);
      if (appName === app.manifest.name) {
        this.appsService.installApp(app);
        break;
      }
    }
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

  _activateHttpServer() {
    if (this.httpServer) {
      return;
    }

    this.httpServer = new HTTPServer(8080);
    this.httpServer.addEventListener('request', (evt) => {
      var response = evt.response;
      var request = evt.request;

      console.log('got request! ' + request.path);
      console.log(request.params);

      var path = request.path;
      if (path !== '/') {
        var appName = request.params.name;
        this._installedApps.forEach((app) => {
          if (app.manifest.name === appName) {
            console.log('found a match');
            if (path === '/manifest.webapp') {
              response.headers['Content-Type'] =
                'application/x-web-app-manifest+json';
              console.log('processing as manifest request');
              var manifest = app.manifest;
              manifest.installs_allowed_from = ['*'];
              manifest.package_path = '/download?app=' + appName;
              console.log(JSON.stringify(manifest));
              response.send(JSON.stringify(manifest));
            } else if (path === '/download') {
              app.export().then((blob) => {
                response.send(blob);
              });
            }
          }
        });
      } else {
        response.send(this.appsService.pretty(this._installedApps));
      }
    });
    this.httpServer.start();

    if (!window.P2PHelper) {
      window.alert('WiFi Direct is not available on this device.');
      window.close();
      return;
    }

    P2PHelper.addEventListener('peerlistchange', (evt) => {
      if (!this._connectedIp) {
        this._connectToFirstPeer(evt.peerList);
      }
    });

    P2PHelper.addEventListener('connected', (evt) => {
      console.log('connected! ' + evt.groupOwner.ipAddress);
      this._connectedIp = 'http://' + evt.groupOwner.ipAddress + ':8080';
      this._requestApps();
    });

    P2PHelper.addEventListener('disconnected', () => {
      console.log('disconnected!');

      P2PHelper.startScan();

      this._connectedIp = null;

      var wifiP2pManager = navigator.mozWifiP2pManager;
      var request = wifiP2pManager.getPeerList();
      request.onsuccess = () => {
        var peers = request.result;
        setTimeout(() => {
          this._connectToFirstPeer(peers);
        }, 500);
      };
    });

    P2PHelper.setDisplayName('P2P Web Server ' + P2PHelper.localAddress);

    P2PHelper.startScan();
  }

  _connectToPeer(address) {
    if (this._connectTimer) {
      return;
    }

    this._peerAddress = address;
    this._connectTimer = setTimeout(() => {
      console.log('connecting to peer!');
      this._connectTimer = null;

      // XXX/drs: Suggestion from justindarc to improve stability.
      P2PHelper.stopScan();
      P2PHelper.connect(address);
    }, 5000);
  }

  _connectToFirstPeer(peers) {
    for (let i = 0; i < peers.length; i++) {
      let peer = peers[i];
      if (peer.connectionStatus !== 'connected') {
        this._connectToPeer(peer.address);
      }
    }
  }

  _deactivateHttpServer() {
    this.httpServer.stop();
    this.httpServer = null;

    P2PHelper.disconnect();
    P2PHelper.stopScan();
  }

  _requestApps() {
    var xhr = new XMLHttpRequest({ mozAnon: true, mozSystem: true });
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var apps = JSON.parse(xhr.responseText);
        console.log('got : ' + xhr.responseText);
        this._appsUpdated(apps);
      }
    };

    xhr.open('GET', this._connectedIp);
    xhr.send();
  }

  _appsUpdated(apps) {
    apps.forEach((_, index) => {
      var app = apps[index];

      if (!app.type) {
        app.type = 'packaged';
      }

      app.manifestURL =
        this._connectedIp + '/manifest.webapp?name=' + app.manifest.name;
      app.url = this._connectedIp + '/download?name=' + app.manifest.name;
    });

    this._proximityApps[this._peerAddress] = apps;
    this._proximityListeners.forEach((callback) => {
      callback();
    });
  }
}
