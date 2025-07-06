import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { Temporal } from 'temporal-polyfill';

// Remember to rename these classes and interfaces!

interface ProjectToolsSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: ProjectToolsSettings = {
	mySetting: 'default'
}

export default class ProjectToolsPlugin extends Plugin {
	settings: ProjectToolsSettings;

	async onload() {
		await this.loadSettings();

		// FIXME: Responding to changes immediately has some issues.
		// // Listen for property value changes in the properties editor
		// this.registerDomEvent(document, 'input', (evt: Event) => {
		// 	this.handlePropertyChange(evt);
		// });
		
		// Also listen for blur events to catch when editing is complete
		this.registerDomEvent(document, 'blur', (evt: Event) => {
			this.handlePropertyChange(evt);
		}, true); // Use capture to catch all blur events

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ProjectToolsSettingTab(this.app, this));
	}

	onunload() {
		// NOTE: registerDomEvent will automatically remove the event listener when this plugin is disabled.
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async handlePropertyChange(evt: Event) {
		const target = evt.target as HTMLElement;
		
		// Check if this is a contenteditable property value
		if (!target.classList.contains('metadata-input-longtext')) return;
		
		// Find the parent property container
		const propertyContainer = target.closest('.metadata-property');
		if (!propertyContainer) return;
		
		// Check if this is the project/status property
		const propertyKey = propertyContainer.getAttribute('data-property-key');
		if (propertyKey !== 'project/status') return;
		
		// Get the new value
		const newValue = target.textContent?.trim();
		if (newValue !== 'complete') return;

		// Remove focus from the input
		target.blur();
		
		// Handle the status change to "complete"
		await this.handleProjectStatusComplete();
	}

	async handleProjectStatusComplete() {
		// NOTE: Assumes the active file is the one being edited in the properties panel.
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) return;
		
		// Check if this is a repeating project
		const fileCache = this.app.metadataCache.getFileCache(activeFile);
		if (!fileCache?.frontmatter?.['project/repeating']) return;
		
		// Show confirmation dialog
		const confirmed = await this.showRepeatConfirmationDialog();
		if (confirmed) {
			// Perform the repeat logic
			await this.repeatProject({ sourcePath: activeFile.path });
			
			// Trigger a refresh of the properties panel to reflect the status change back to "active"
			this.app.workspace.trigger('editor-change');
		}
		// If user cancels, we leave the status as "complete" since they explicitly set it
	}




	async showRepeatConfirmationDialog(): Promise<boolean> {
		return new Promise((resolve) => {
			const modal = new Modal(this.app);
			modal.titleEl.setText('Repeat Project');
			modal.contentEl.createEl('p', { 
				text: 'This is a repeating project. Do you want to mark it as complete and schedule the next occurrence?' 
			});
			
			const buttonContainer = modal.contentEl.createDiv({ cls: 'modal-button-container' });
			buttonContainer.style.display = 'flex';
			buttonContainer.style.gap = '10px';
			buttonContainer.style.justifyContent = 'flex-end';
			buttonContainer.style.marginTop = '20px';
			
			const cancelButton = buttonContainer.createEl('button', { text: 'Cancel' });
			cancelButton.addEventListener('click', () => {
				modal.close();
				resolve(false);
			});
			
			const confirmButton = buttonContainer.createEl('button', { 
				text: 'Repeat Project',
				cls: 'mod-cta'
			});
			confirmButton.addEventListener('click', () => {
				modal.close();
				resolve(true);
			});
			
			modal.open();
		});
	}

	async repeatProject(ctx: { sourcePath: string }): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(ctx.sourcePath);
		if (!file || !(file instanceof TFile)) {
			new Notice('Unable to find file to update');
			return;
		}

		const fileCache = this.app.metadataCache.getFileCache(file);
		const frontmatter = fileCache?.frontmatter;
		
		if (!frontmatter) {
			new Notice('No frontmatter found');
			return;
		}

		const repeatInterval = frontmatter['project/repeat-interval'];
		const dueDate = frontmatter['project/due-date'];
		const startDate = frontmatter['project/start-date'];
		
		if (!repeatInterval) {
			new Notice('No repeat interval specified');
			return;
		}

		try {
			// Parse the ISO 8601 duration
			const duration = Temporal.Duration.from(repeatInterval);
			
			// Calculate new dates
			let newDueDate = dueDate;
			let newStartDate = startDate;
			
			if (dueDate) {
				const dueDateObj = Temporal.PlainDate.from(dueDate);
				newDueDate = dueDateObj.add(duration).toString();
			}
			
			if (startDate) {
				const startDateObj = Temporal.PlainDate.from(startDate);
				newStartDate = startDateObj.add(duration).toString();
			}
			
			// Update the frontmatter using processFrontMatter
			await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
				if (newDueDate) {
					frontmatter['project/due-date'] = newDueDate;
				}
				if (newStartDate) {
					frontmatter['project/start-date'] = newStartDate;
				}
				frontmatter['project/status'] = 'active';
			});
			
			new Notice('Project repeated successfully');
			
		} catch (error) {
			new Notice(`Error repeating project: ${error.message}`);
		}
	}
}

class ProjectToolsSettingTab extends PluginSettingTab {
	plugin: ProjectToolsPlugin;

	constructor(app: App, plugin: ProjectToolsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
