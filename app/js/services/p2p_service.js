import /* global HTTPServer */ 'p2p/fxos-web-server';
import /* global P2PHelper */ 'p2p/p2p_helper';

import { Service } from 'fxos-mvc/dist/mvc';

import AppsService from 'app/js/services/apps_service';
import DeviceNameService from 'app/js/services/device_name_service';

// Enable this if you want the device to pretend that it's connected to another
// device and request its own apps.
//window.TEST_MODE = true;

var singletonGuard = {};
var instance;

export default class P2pService extends Service {
  constructor(guard) {
    if (guard !== singletonGuard) {
      console.error('Cannot create singleton class');
      return;
    }

    super();

    this._peerName = null;
    this._connectedIp = window.TEST_MODE ? 'http://127.0.0.1:8080' : null;

    this._proximityApps = {};
    this._proximityAddons = {};

    AppsService.instance.getInstalledApps().then((apps) => {
      this._installedApps = apps;
    });

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

    window.addEventListener('visibilitychange', P2PHelper.restartScan);

    window.addEventListener(
      'beforeunload', this._deactivateHttpServer.bind(this));

    setTimeout(() => {
      this._peerName = 'asdf';
      this._appsUpdated([
        {manifest: {name: 'Sharing', description: 'doo'}, owner: 'Doug'},
        {manifest: {name: 'HelloWorld', description: 'too'}, owner: 'Ham'},
        {manifest: {name: 'test', description: 'ham'}, owner: 'Hurr'}]);
    }, 2000);

    setTimeout(() => {
      this._peerName = 'foo';
      this._appsUpdated([]);
    }, 4000);

    this._enableP2pConnection();
  }

  static get instance() {
    if (!instance) {
      instance = new this(singletonGuard);
    }
    return instance;
  }

  _broadcastLoaded(val) {
    this._broadcast = val;
    if (this._broadcast) {
      this._activateHttpServer();
    } else {
      this._deactivateHttpServer();
    }
    this._dispatchEvent('broadcast');
  }

  downloadApp(appName) {
    var apps = AppsService.instance.flatten(this._proximityApps);
    console.log('scanning in ' + JSON.stringify(apps));
    for (var i = 0; i < apps.length; i++) {
      var app = apps[i];

      if (appName === app.manifest.name) {
        console.log('found matching app: ' + JSON.stringify(app));
        var xhr = new XMLHttpRequest({ mozAnon: true, mozSystem: true });
        console.log(
          'requesting ' + app.url + '/download?app=' + app.manifest.name);
        xhr.open('GET', app.url + '/download?app=' + app.manifest.name);
        xhr.responseType = 'blob';
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.status === 200) {
            console.log('blob loaded');
            //console.log(ev);
            //console.log(xhr.responseText);
            //var blob =
            //  new Blob([xhr.response], {type: 'application/openwebapp+zip'});
            //var file = new File([blob], 'file.tmp');
            var sdcard = navigator.getDeviceStorage('sdcard');
            if (!sdcard) {
              console.error('No SD card!');
              return;
            }
            var fileName = 'temp-app.zip';
            var delReq = sdcard.delete(fileName);
            delReq.onsuccess = delReq.onerror = () => {
              var req = sdcard.addNamed(
                new Blob([xhr.response], {type: 'application/openwebapp+zip'}),
                fileName);
              req.onsuccess = () => {
                var getReq = sdcard.get(fileName);
                getReq.onsuccess = function() {
                  var file = this.result;
                  AppsService.instance.installApp(file);
                };
                getReq.onerror = function() {
                  console.error('error getting file', this.error.name);
                };
              };
              req.onerror = (e) => {
                console.error('error saving blob', e);
              };
            };
          }
        };
        xhr.send();
      }
      /*
      if (appName === app.manifest.name) {
        AppsService.instance.installApp(app);
        break;
      }
      */
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
        var appName = request.params.app;
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
              console.log('processing as download');
              app.export().then((blob) => {
                console.log('sending blob: ');
                console.log(blob);
                response.headers['Content-Type'] = blob.type;
                response.sendFile(blob);
              });
            }
          }
        });
      } else {
        response.send(AppsService.instance.pretty(this._installedApps));
      }
    });
    this.httpServer.start();
  }

  _enableP2pConnection() {
    if (!window.P2PHelper) {
      window.alert('WiFi Direct is not available on this device.');
      window.close();
      return;
    }

    P2PHelper.addEventListener('peerlistchange', (evt) => {
      if (!this._connectedIp) {
        this._connectToFirstPeer(evt.peerList);
      }

      for (var index in evt.peerList) {
        var peer = evt.peerList[index];
        if (!this._proximityApps[peer.name]) {
          this._setProximityApps(peer.name, {});
        }
      }

      // Compare this list of peers with the previous one. Remove anyone out of
      // range from the proximity apps list.
      for (var oldPeer in this._proximityApps) {
        var foundMatch = false;
        for (index in evt.peerList) {
          var newPeer = evt.peerList[index];
          if (newPeer.name === oldPeer) {
            foundMatch = true;
          }
        }
        if (!foundMatch) {
          this._setProximityApps(oldPeer.name, undefined);
        }
      }
    });

    P2PHelper.addEventListener('connected', (evt) => {
      console.log('connected! ' + evt.groupOwner.ipAddress);
      this._connectedIp = 'http://' + evt.groupOwner.ipAddress + ':8080';
      this._requestApps();
    });

    P2PHelper.addEventListener('disconnected', () => {
      console.log('disconnected!');

      // XXX/drs: Suggestion from justindarc to improve stability.
      P2PHelper.disconnect();
      P2PHelper.startScan();

      delete this._proximityApps[this._peerName];
      this._connectedIp = null;
      this._peerName = null;

      var wifiP2pManager = navigator.mozWifiP2pManager;
      var request = wifiP2pManager.getPeerList();
      request.onsuccess = () => {
        var peers = request.result;
        setTimeout(() => {
          this._connectToFirstPeer(peers);
        }, 500);
      };
    });

    P2PHelper.setDisplayName('flame');
    DeviceNameService.instance.addEventListener('devicenamechange', (e) => {
      P2PHelper.setDisplayName(e.deviceName);
    });

    P2PHelper.startScan();
  }

  _connectToPeer(peer) {
    if (this._connectTimer) {
      return;
    }

    this._peerName = peer.name;
    this._connectTimer = setTimeout(() => {
      console.log('connecting to peer!');
      this._connectTimer = null;

      // XXX/drs: Suggestion from justindarc to improve stability.
      P2PHelper.stopScan();
      P2PHelper.connect(peer.address);
    }, 10000);
  }

  _connectToFirstPeer(peers) {
    var connectToPeer;

    for (var i = 0; i < peers.length; i++) {
      var peer = peers[i];
      if (!this._proximityApps[peer.name]) {
        connectToPeer = peer;
      }
    }

    // We've already connected to every peer and queried them for their apps.
    // Re-connect to the one that we were connected to the oldest time ago.
    if (!connectToPeer) {
      for (i = 0; i < peers.length; i++) {
        var oldPeer = peers[i];
        if (!connectToPeer || oldPeer.connectedTs < connectToPeer.connectedTs) {
          connectToPeer = oldPeer;
        }
      }
    }

    if (connectToPeer) {
      this._connectToPeer(connectToPeer);
    }
  }

  _deactivateHttpServer() {
    this.httpServer.stop();
    this.httpServer = null;

    P2PHelper.disconnect();
    P2PHelper.stopScan();
  }

  _requestApps() {
    console.log('1 connected ip is: ' + this._connectedIp);
    var xhr = new XMLHttpRequest({ mozAnon: true, mozSystem: true });
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var apps = JSON.parse(xhr.responseText);
        console.log('2 connected ip is: ' + this._connectedIp);
        console.log('got : ' + xhr.responseText);
        this._appsUpdated(apps);
      }
    };

    xhr.open('GET', this._connectedIp);
    xhr.send();
  }

  _appsUpdated(apps) {
    console.log('3 connected ip is: ' + this._connectedIp);
    apps.forEach((_, index) => {
      var app = apps[index];
      app.url = this._connectedIp;
      if (!app.type) {
        app.type = 'packaged';
      }
    });

    this._setProximityApps(this._peerName, apps);

    // XXX/drs: Forget about disconnecting from this peer for now. Connections
    // are too flaky for peer rotation to work.
    //P2PHelper.disconnect();
    P2PHelper.startScan();
  }

  _setProximityApps(peerName, apps) {
    if (apps !== undefined) {
      this._proximityApps[peerName] = {
        name: peerName,
        apps: apps,
        connectedTs: +new Date()
      };
    } else {
      delete this._proximityApps[peerName];
    }
    this._dispatchEvent('proximity');
  }
}
