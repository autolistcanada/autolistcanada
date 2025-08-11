# AutoList Canada Chrome Extension - Loading Instructions

## Loading the Extension

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (toggle in the top right corner)
3. Click "Load unpacked"
4. Select the `crosslist-pro-extension` folder

## Supported Domains

The extension works on the following platforms:
- eBay (ca, com, co.uk, de, fr, it, es, com.au)
- Etsy
- Poshmark

## Troubleshooting

If you encounter issues:

1. **Folder Nesting**: Ensure you're selecting the `crosslist-pro-extension` folder that contains the `manifest.json` file directly, not a parent folder.

2. **Cache Issues**: 
   - Disable and re-enable the extension
   - Remove and re-add the extension
   - Restart Chrome

3. **Previous Copies**: If you've loaded this extension before:
   - Remove the old version from `chrome://extensions` before loading the new one
   - Clear Chrome's extension cache by restarting the browser

4. **Manifest Errors**: If Chrome reports manifest errors:
   - Verify all required files are present
   - Check that the manifest.json file is properly formatted
   - Ensure all referenced files exist in their specified paths

The extension should now load without errors and display the proper icon in chrome://extensions.
