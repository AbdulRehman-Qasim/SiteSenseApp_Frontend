const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidManifestFix(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];

    // 1. Ensure the 'tools' namespace is defined in the root <manifest> tag
    if (!androidManifest.manifest.$['xmlns:tools']) {
      androidManifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    // 2. Add the tools:replace attribute to the <application> tag
    // This tells Gradle: "If there is a conflict for 'appComponentFactory', use MY version, not the library's."
    const key = 'tools:replace';
    const value = 'android:appComponentFactory';

    if (mainApplication.$[key]) {
      // If tools:replace already exists, append our value to it
      if (!mainApplication.$[key].includes(value)) {
        mainApplication.$[key] = `${mainApplication.$[key]},${value}`;
      }
    } else {
      // Otherwise, create it
      mainApplication.$[key] = value;
    }

    return config;
  });
};