/* globals requirejs */

window.COMPONENTS_BASE_URL = './components/';

requirejs.config({
  paths: {
    'gaia-component': '../components/gaia-component/gaia-component',
    'gaia-dialog': '../components/gaia-dialog/gaia-dialog',
    'gaia-icons': '../components/gaia-icons/gaia-icons',
    'drag': '../components/drag/index',
    'evt': '../components/evt/index'
  }
});
