# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Obsidian plugin project that provides project management tools for markdown files. It includes a code block processor that renders a dropdown for managing project status in frontmatter properties.

## Development Commands

- `npm run dev` - Start development mode with watch compilation
- `npm run build` - Build for production (runs TypeScript check + esbuild)
- `npm test` - Run Jest test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run version` - Bump version and update manifest/versions files
- `npm i` - Install dependencies

## Architecture

- **main.ts** - Main plugin entry point extending Obsidian's Plugin class
- **esbuild.config.mjs** - Build configuration bundling TypeScript to main.js
- **manifest.json** - Plugin metadata for Obsidian
- **versions.json** - Version compatibility mapping

The plugin follows standard Obsidian plugin patterns:
- Plugin lifecycle methods (onload/onunload)
- Settings management with loadData/saveData
- Command registration via addCommand
- Modal and SettingTab classes extending Obsidian base classes
- Event handling with registerDomEvent/registerInterval
- **Frontmatter updates using `app.fileManager.processFrontMatter`** (not manual parsing)

## Key Files

- Source code is in **main.ts** (single file plugin)
- Build output is **main.js** (generated, not committed)
- Plugin configuration in **manifest.json**
- TypeScript config targets ES6 with strict null checks

## Project Tools Feature

The main feature is a `project-tools` code block processor that renders a dropdown for managing project status:

- Add ```project-tools``` to any markdown file
- Shows dropdown with options: Active, Complete, Dropped
- Automatically reads current `project/status` from frontmatter
- Updates frontmatter when dropdown value changes
- Defaults to "Active" if no current status exists

## Testing

### Automated Tests
- **Jest** BDD-style test suite with TypeScript support
- **Test Structure**: `/tests/` directory with mocked Obsidian API
- **Coverage**: Project status management, repeating projects, API integration
- **Run Tests**: `npm test` or `npm run test:watch`
- **Note**: Uses Obsidian's `processFrontMatter` API (no manual parsing tests needed)

### Manual Testing
Plugin can be tested by copying main.js, styles.css, and manifest.json to `.obsidian/plugins/your-plugin-name/` in an Obsidian vault.