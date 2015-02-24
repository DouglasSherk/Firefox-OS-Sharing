[![Build Status](https://travis-ci.org/fxos/messages.svg?branch=master)](https://travis-ci.org/fxos/sharing)

# Sharing

Want to hack? Read the [documentation](https://github.com/fxos/docs/wiki/Development-Setup).

# Special Build Instructions

1. Checkout ```fxos-sharing``` repo:

        git clone 'git@github.com:fxos/sharing.git'

2. If you haven't already, install Bower and Gulp (preferably globally):

        npm install -g bower gulp

3. Install the dependencies:

        npm install && bower install && npm run apm

4. Run Gulp to start the file watchers for the build system:

        gulp

5. Flash ```dist/app``` onto your device using Firefox's WebIDE.
