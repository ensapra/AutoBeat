
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      {
          "id": "cordova-plugin-device.device",
          "file": "plugins/cordova-plugin-device/www/device.js",
          "pluginId": "cordova-plugin-device",
        "clobbers": [
          "device"
        ]
        },
      {
          "id": "cordova-plugin-background-mode.BackgroundMode",
          "file": "plugins/cordova-plugin-background-mode/www/background-mode.js",
          "pluginId": "cordova-plugin-background-mode",
        "clobbers": [
          "cordova.plugins.backgroundMode",
          "plugin.backgroundMode"
        ]
        }
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      "cordova-androidx-build": "1.0.4",
      "cordova-plugin-background-mode": "0.8.0",
      "cordova-plugin-device": "2.1.0"
    };
    // BOTTOM OF METADATA
    });
    