import { jest } from '@jest/globals';
import ProjectToolsPlugin from '../main';
import { App, TFile } from 'obsidian';

describe('Project Status Management via Properties Editor', () => {
  let plugin: ProjectToolsPlugin;
  let mockApp: App;
  let mockFile: TFile;

  beforeEach(() => {
    mockApp = new App();
    plugin = new ProjectToolsPlugin(mockApp, {} as any);
    mockFile = new TFile();
    
    // Ensure TFile instanceof check works
    Object.setPrototypeOf(mockFile, TFile.prototype);
  });

  describe('When property changes are detected', () => {
    describe('Given a project/status property change event', () => {
      it('should handle the property change', async () => {
        // Given
        const mockPropertyContainer = document.createElement('div');
        mockPropertyContainer.classList.add('metadata-property');
        mockPropertyContainer.setAttribute('data-property-key', 'project/status');
        
        const mockTarget = document.createElement('div');
        mockTarget.classList.add('metadata-input-longtext');
        mockTarget.textContent = 'complete';
        mockPropertyContainer.appendChild(mockTarget);
        
        // Mock closest method
        jest.spyOn(mockTarget, 'closest').mockReturnValue(mockPropertyContainer);
        
        const mockEvent = { target: mockTarget } as Event;
        
        // Mock handleProjectStatusComplete
        const handleStatusCompleteSpy = jest.spyOn(plugin, 'handleProjectStatusComplete').mockResolvedValue();

        // When
        await plugin.handlePropertyChange(mockEvent);

        // Then
        expect(handleStatusCompleteSpy).toHaveBeenCalled();
      });
    });

    describe('Given a non-project/status property change', () => {
      it('should ignore the change', async () => {
        // Given
        const mockPropertyContainer = document.createElement('div');
        mockPropertyContainer.classList.add('metadata-property');
        mockPropertyContainer.setAttribute('data-property-key', 'other-property');
        
        const mockTarget = document.createElement('div');
        mockTarget.classList.add('metadata-input-longtext');
        mockTarget.textContent = 'value';
        
        jest.spyOn(mockTarget, 'closest').mockReturnValue(mockPropertyContainer);
        
        const mockEvent = { target: mockTarget } as Event;
        
        const handleStatusCompleteSpy = jest.spyOn(plugin, 'handleProjectStatusComplete').mockResolvedValue();

        // When
        await plugin.handlePropertyChange(mockEvent);

        // Then
        expect(handleStatusCompleteSpy).not.toHaveBeenCalled();
      });
    });

    describe('Given a status change to non-complete value', () => {
      it('should ignore the change', async () => {
        // Given
        const mockPropertyContainer = document.createElement('div');
        mockPropertyContainer.classList.add('metadata-property');
        mockPropertyContainer.setAttribute('data-property-key', 'project/status');
        
        const mockTarget = document.createElement('div');
        mockTarget.classList.add('metadata-input-longtext');
        mockTarget.textContent = 'active';
        
        jest.spyOn(mockTarget, 'closest').mockReturnValue(mockPropertyContainer);
        
        const mockEvent = { target: mockTarget } as Event;
        
        const handleStatusCompleteSpy = jest.spyOn(plugin, 'handleProjectStatusComplete').mockResolvedValue();

        // When
        await plugin.handlePropertyChange(mockEvent);

        // Then
        expect(handleStatusCompleteSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('When handling project status completion', () => {
    describe('Given a repeating project', () => {
      it('should show confirmation dialog and repeat if confirmed', async () => {
        // Given
        mockFile.cache = {
          frontmatter: {
            'project/repeating': true,
            'project/repeat-interval': 'P1W'
          }
        };

        jest.spyOn(mockApp.workspace, 'getActiveFile').mockReturnValue(mockFile);
        jest.spyOn(mockApp.metadataCache, 'getFileCache').mockReturnValue(mockFile.cache);
        
        const showDialogSpy = jest.spyOn(plugin, 'showRepeatConfirmationDialog').mockResolvedValue(true);
        const repeatProjectSpy = jest.spyOn(plugin, 'repeatProject').mockResolvedValue();

        // When
        await plugin.handleProjectStatusComplete();

        // Then
        expect(showDialogSpy).toHaveBeenCalled();
        expect(repeatProjectSpy).toHaveBeenCalledWith({ sourcePath: mockFile.path });
      });
    });

    describe('Given a non-repeating project', () => {
      it('should do nothing', async () => {
        // Given
        mockFile.cache = {
          frontmatter: {
            'project/status': 'active'
          }
        };

        jest.spyOn(mockApp.workspace, 'getActiveFile').mockReturnValue(mockFile);
        jest.spyOn(mockApp.metadataCache, 'getFileCache').mockReturnValue(mockFile.cache);
        
        const showDialogSpy = jest.spyOn(plugin, 'showRepeatConfirmationDialog').mockResolvedValue(true);

        // When
        await plugin.handleProjectStatusComplete();

        // Then
        expect(showDialogSpy).not.toHaveBeenCalled();
      });
    });

    describe('Given no active file', () => {
      it('should do nothing', async () => {
        // Given
        jest.spyOn(mockApp.workspace, 'getActiveFile').mockReturnValue(null);
        
        const showDialogSpy = jest.spyOn(plugin, 'showRepeatConfirmationDialog').mockResolvedValue(true);

        // When
        await plugin.handleProjectStatusComplete();

        // Then
        expect(showDialogSpy).not.toHaveBeenCalled();
      });
    });
  });
});