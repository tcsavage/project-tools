# Makefile for Tom's Project Tools Obsidian Plugin

# Plugin metadata from manifest.json
PLUGIN_ID = tcsavage-project-tools
PLUGIN_NAME = Tom's Project Tools

# Build artifacts
BUILD_FILES = main.js manifest.json styles.css

# Default target
.PHONY: all
all: build

# Build the plugin
.PHONY: build
build:
	npm run build

# Install to target vault (requires TARGET_VAULT env var)
.PHONY: install
install: build
	@if [ -z "$(TARGET_VAULT)" ]; then \
		echo "Error: TARGET_VAULT environment variable is not set"; \
		echo "Usage: TARGET_VAULT=/path/to/vault make install"; \
		exit 1; \
	fi
	@if [ ! -d "$(TARGET_VAULT)" ]; then \
		echo "Error: TARGET_VAULT directory '$(TARGET_VAULT)' does not exist"; \
		exit 1; \
	fi
	@echo "Installing $(PLUGIN_NAME) to $(TARGET_VAULT)"
	@mkdir -p "$(TARGET_VAULT)/.obsidian/plugins/$(PLUGIN_ID)"
	@cp $(BUILD_FILES) "$(TARGET_VAULT)/.obsidian/plugins/$(PLUGIN_ID)/"
	@echo "Plugin installed successfully to $(TARGET_VAULT)/.obsidian/plugins/$(PLUGIN_ID)/"
	@echo "Restart Obsidian and enable the plugin in Community Plugins settings"

# Clean build artifacts
.PHONY: clean
clean:
	rm -f main.js

# Run tests
.PHONY: test
test:
	npm test

# Run tests in watch mode
.PHONY: test-watch
test-watch:
	npm run test:watch

# Development build with watch
.PHONY: dev
dev:
	npm run dev

# Show help
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  build       - Build the plugin"
	@echo "  install     - Build and install to TARGET_VAULT"
	@echo "  clean       - Remove build artifacts"
	@echo "  test        - Run tests"
	@echo "  test-watch  - Run tests in watch mode"
	@echo "  dev         - Start development build with watch"
	@echo "  help        - Show this help message"
	@echo ""
	@echo "Usage examples:"
	@echo "  make build"
	@echo "  TARGET_VAULT=/path/to/vault make install"
	@echo "  TARGET_VAULT=~/Documents/MyVault make install"