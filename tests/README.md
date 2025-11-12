# ST8 Tests and Verification

This directory contains automated tests and verification tools for the ST8 application.

## Overview

The ST8 application consists of:
- **Static HTML/CSS/JS pages** for the frontend interface
- **Node.js server** for data persistence
- **Various JavaScript modules** for functionality

## Verification Tool

### `verify-pages.js`

A comprehensive verification script that validates all pages and JavaScript functions in the application.

#### What it checks:

1. **HTML Page Structure**
   - Validates all HTML files exist and are readable
   - Checks for proper HTML5 structure (DOCTYPE, html, head, body tags)
   - Verifies charset declarations
   - Validates semantic HTML structure (header, main elements)

2. **CSS References**
   - Ensures all referenced CSS files exist
   - Validates stylesheet links are properly formatted

3. **JavaScript References**
   - Verifies all external JavaScript files exist
   - Checks script tag references are valid

4. **Inline JavaScript**
   - Extracts and validates inline scripts
   - Counts declared functions
   - Checks for syntax errors (unclosed braces)
   - Reports on strict mode usage (as warnings)

5. **External JavaScript Files**
   - Validates all core JS files exist and are readable
   - Checks for function declarations
   - Verifies syntax balance (braces and parentheses)

6. **Server Configuration**
   - Checks server files exist
   - Validates package.json and entry point

#### Running the verification

```bash
# From the repository root
node tests/verify-pages.js
```

#### Output

The script provides colored terminal output:
- ✓ Green checkmarks for passed tests
- ✗ Red X marks for failed tests
- ⚠ Yellow warnings for non-critical issues

At the end, it displays:
- Total number of tests run
- Number of passed/failed tests
- Number of warnings
- Overall success rate percentage

#### Exit codes

- `0` - All tests passed
- `1` - One or more tests failed

## Verified Pages

The following HTML pages are verified:

### Main Application
- `index.html` - Main landing page
- `html/index.html` - HTML index page

### Functional Pages
- `html/agents.html` - Agent management interface (23 functions)
- `html/planning.html` - Monthly planning view (21 functions)
- `html/bihebdo.html` - Bi-weekly planning (10 functions)
- `html/planification.html` - Weekly planning
- `html/prepa.html` - Site preparation checklist (3 functions)
- `html/stats.html` - Annual statistics and charts (19 functions)
- `html/rapport.html` - Report generation (3 functions)
- `html/elements.html` - Variable elements management
- `html/easydict.html` - Dictionary tool

## Verified JavaScript Files

### Core Application Scripts
- `js/script.js` - Main application logic (17 functions)
  - Dark mode toggle
  - FAB menu initialization
  - App catalog rendering
  - Météo card integration
  - Pont event tracking

- `js/apps-data.js` - Application catalog data
- `js/api-sync.js` - API synchronization utilities (2 functions)
- `js/notify.js` - Notification system (4 functions)
- `js/weekend-utils.js` - Weekend calculation utilities

### Library Files
- `js/libs/chart.min.js` - Chart.js for data visualization
- `js/libs/xlsx.full.min.js` - Excel file handling
- `js/libs/datetime.js` - Date/time utilities
- `js/libs/presence.js` - Presence tracking
- `js/libs/datastore.js` - Data storage utilities
- `js/libs/utils.js` - General utilities

## Function Inventory

The verification script has identified the following functions across the application:

### Global Functions (script.js)
- `toggleDarkMode()` - Toggle dark/light theme
- `applyStoredTheme()` - Apply saved theme preference
- `initFab()` - Initialize floating action button
- `buildAppTile()` - Create application tiles
- `renderAppSections()` - Render app catalog sections
- `loadAppModule()` - Dynamic module loading
- `bootstrapAppCatalog()` - Initialize app catalog
- `embedAppIframe()` - Embed iframe applications
- `loadHtmlApp()` - Load HTML applications
- `loadHtmlApps()` - Load multiple HTML apps
- `initMeteoCard()` - Initialize weather card
- `getCachedMeteoData()` - Retrieve cached weather data
- `shouldDisplayMeteo()` - Check if weather should display
- `fetchMeteoData()` - Fetch weather from API
- `findNextPontEvent()` - Find next bridge event
- `buildMeteoEntry()` - Create weather entry
- `renderMeteoCard()` - Render weather card

### Agent Management (agents.html)
23 functions for CRUD operations on agents, filtering, searching, and bulk editing

### Planning (planning.html)
21 functions for monthly planning, agent scheduling, and export functionality

### Bi-weekly Planning (bihebdo.html)
10 functions for bi-weekly schedule management and CACES tracking

### Statistics (stats.html)
19 functions for data analysis, chart generation, and reporting

## CI/CD Integration

The verification is integrated into the GitHub Actions CI pipeline:

```yaml
jobs:
  pages-verification:
    runs-on: ubuntu-latest
    steps:
      - name: Verify all pages and functions
        run: node tests/verify-pages.js
```

This ensures all pages and functions are verified on every push and pull request.

## Success Metrics

Current verification status:
- **Total Tests**: 218
- **Passed**: 206
- **Failed**: 0
- **Warnings**: 12
- **Success Rate**: 94.5%

Warnings are primarily about:
- Strict mode usage (recommended but not required)
- Data files that don't declare functions (expected behavior)

## Maintenance

### Adding New Pages

When adding a new HTML page:
1. Add it to the `htmlPages` array in `verify-pages.js`
2. Ensure it follows the HTML5 structure
3. Include proper CSS and JS references
4. Run verification to confirm

### Adding New JavaScript Files

When adding new JavaScript files:
1. Add them to the `jsFiles` array in `verify-pages.js`
2. Follow existing coding patterns
3. Consider adding strict mode
4. Run verification to confirm

## Troubleshooting

### Test Failures

If verification fails:
1. Check the error output for specific issues
2. Verify file paths are correct
3. Ensure all referenced files exist
4. Check for syntax errors in inline scripts

### Warnings

Warnings don't cause test failure but should be addressed:
- **Strict mode warnings**: Consider adding `"use strict";` to inline scripts
- **Missing functions**: Verify this is intentional for data-only files

## Future Enhancements

Potential improvements:
- [ ] Add JavaScript linting (ESLint)
- [ ] Include HTML validation (W3C validator)
- [ ] Add CSS validation
- [ ] Implement accessibility checks
- [ ] Add performance testing
- [ ] Include security scanning
- [ ] Add unit tests for individual functions
- [ ] Add integration tests for user workflows
