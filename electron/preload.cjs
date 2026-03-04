// Preload script for Electron
// This script runs before the renderer process loads and can be used
// to expose specific APIs to the renderer in a secure way

const { contextBridge } = require('electron');

// You can expose APIs here if needed in the future
contextBridge.exposeInMainWorld('electron', {
  // Add any APIs you want to expose to the renderer process here
  platform: process.platform
});
