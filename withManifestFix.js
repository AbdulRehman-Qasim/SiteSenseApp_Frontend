const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withManifestFix(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    
    // Ensure the main application tag exists
    if (!androidManifest.manifest.application || !androidManifest.manifest.application[0]) {
      return config;
    }
    
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
      // If tools:replace already exists, append our value to it if it's not there
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