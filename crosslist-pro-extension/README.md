# AutoList Canada - Crosslist Pro Extension

A production-ready Chrome Manifest V3 extension for crosslisting items across multiple marketplaces with AI-powered tools.

## Features

- **Crosslisting**: Import listings from one marketplace and crosslist to others
- **AI Tools**: AI-powered title, description, tag, and price optimization
- **Sync Visualization**: Real-time sync status and history
- **Privacy First**: Opt-in telemetry, clear data controls, and consent gating
- **Multi-Platform**: Support for eBay, Etsy, Poshmark, and more

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. Pin the extension for easy access

## Usage

1. Navigate to a supported marketplace (eBay, Etsy, Poshmark)
2. Import listings using the "Import to AutoList" buttons
3. Open the extension popup to access tools:
   - Bulk Crosslist
   - Smart Delist/Relist
   - Sync Visualizer
   - AI Title/Description/Tags
   - Price Suggestion
   - Activity Logs
   - Settings

## Design System

- **Color Palette**: Vibrant orange, teal, lime, maple red, forest, and sky accents
- **UI Language**: Dark base with translucent label plates for text legibility
- **Patterns**: Subtle tessellated low-poly backgrounds
- **Icons**: Leaf-faceted shapes with vein geometric overlays
- **Accessibility**: ARIA labels, keyboard navigation, focus rings

## Sync Engine

- Local storage adapter for captured listings
- Remote API adapter for external sync endpoints
- Sync history tracking and visualization
- Platform-specific listing transformation

## Privacy & Compliance

- Consent-gated telemetry and remote sync features
- Clear data controls and export functionality
- Minimal permissions with least privilege principle
- Detailed privacy policy and data safety documentation

## Development

### Project Structure

```
crosslist-pro-extension/
├── manifest.json
├── popup.html/css/js
├── options.html/css/js
├── sync.html/css/js
├── background.js
├── content/
│   ├── common.js
│   ├── ebay.js
│   ├── etsy.js
│   └── poshmark.js
├── sync/
│   ├── index.js
│   ├── sync-manager.js
│   └── adapters/
│       ├── base-adapter.js
│       ├── local-adapter.js
│       └── remote-adapter.js
├── ai/
│   ├── index.js
│   ├── title-generator.js
│   ├── description-builder.js
│   ├── tag-assistant.js
│   └── price-optimizer.js
├── ui/
│   ├── tokens.css
│   ├── base.css
│   ├── patterns.css
│   ├── popup.css
│   ├── options.css
│   └── sync.css
├── assets/
│   └── ui/
│       ├── leaf-faceted.svg
│       ├── vein-geo-overlay.svg
│       ├── bg-lowpoly.svg
│       ├── icon-sync.svg
│       ├── icon-ok.svg
│       ├── icon-error.svg
│       ├── mktg-ebay.svg
│       ├── mktg-etsy.svg
│       └── mktg-posh.svg
└── LEGAL/
    ├── PRIVACY_POLICY.md
    ├── TERMS_OF_USE.md
    └── DATA_SAFETY.md
```

### Building

No build process required. The extension uses vanilla JavaScript with ES6 modules.

### Testing

1. Load the extension in Chrome as an unpacked extension
2. Navigate to supported marketplace pages
3. Verify that "Import to AutoList" buttons appear on listings
4. Click buttons to capture listing data
5. Open the popup to verify captured listings appear
6. Test all 9 tile functions in the popup
7. Verify platform connection toggles work
8. Check that all UI elements display correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact support@autolistcanada.ca
