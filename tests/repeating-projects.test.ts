import { jest } from '@jest/globals';
import ProjectToolsPlugin from '../main';
import { App, TFile } from 'obsidian';
import { Temporal } from 'temporal-polyfill';

describe('Repeating Project Functionality via Properties Editor', () => {
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

  describe('When repeating a project', () => {
    describe('Given a repeating project with valid dates and interval', () => {
      it('should increment dates by the specified interval and set status to active', async () => {
        // Given
        const mockContext = { sourcePath: 'test.md' };
        mockFile.cache = {
          frontmatter: {
            'project/status': 'complete',
            'project/repeating': true,
            'project/repeat-interval': 'P1W',
            'project/due-date': '2024-01-15',
            'project/start-date': '2024-01-08'
          }
        };

        jest.spyOn(mockApp.vault, 'getAbstractFileByPath').mockReturnValue(mockFile);
        jest.spyOn(mockApp.metadataCache, 'getFileCache').mockReturnValue(mockFile.cache);
        const processFrontMatterSpy = jest.spyOn(mockApp.fileManager, 'processFrontMatter').mockImplementation(async (file, fn) => {
          const frontmatter = file.cache?.frontmatter || {};
          fn(frontmatter);
          if (!file.cache) {
            file.cache = {};
          }
          file.cache.frontmatter = frontmatter;
        });

        // When
        await plugin.repeatProject(mockContext);

        // Then
        expect(processFrontMatterSpy).toHaveBeenCalledWith(mockFile, expect.any(Function));
        
        // Verify the frontmatter was updated correctly
        expect(mockFile.cache.frontmatter['project/status']).toBe('active');
        expect(mockFile.cache.frontmatter['project/due-date']).toBe('2024-01-22');
        expect(mockFile.cache.frontmatter['project/start-date']).toBe('2024-01-15');
        expect(mockFile.cache.frontmatter['project/repeating']).toBe(true); // Should preserve
      });
    });

    describe('Given a repeating project with monthly interval', () => {
      it('should increment dates by one month', async () => {
        // Given
        const mockContext = { sourcePath: 'test.md' };
        mockFile.cache = {
          frontmatter: {
            'project/status': 'complete',
            'project/repeating': true,
            'project/repeat-interval': 'P1M',
            'project/due-date': '2024-01-31',
            'project/start-date': '2024-01-01'
          }
        };

        jest.spyOn(mockApp.vault, 'getAbstractFileByPath').mockReturnValue(mockFile);
        jest.spyOn(mockApp.metadataCache, 'getFileCache').mockReturnValue(mockFile.cache);
        const processFrontMatterSpy = jest.spyOn(mockApp.fileManager, 'processFrontMatter').mockImplementation(async (file, fn) => {
          const frontmatter = file.cache?.frontmatter || {};
          fn(frontmatter);
          if (!file.cache) {
            file.cache = {};
          }
          file.cache.frontmatter = frontmatter;
        });

        // When
        await plugin.repeatProject(mockContext);

        // Then
        expect(processFrontMatterSpy).toHaveBeenCalledWith(mockFile, expect.any(Function));
        
        // Verify the frontmatter was updated correctly
        expect(mockFile.cache.frontmatter['project/status']).toBe('active');
        expect(mockFile.cache.frontmatter['project/due-date']).toBe('2024-02-29');
        expect(mockFile.cache.frontmatter['project/start-date']).toBe('2024-02-01');
      });
    });

    describe('Given a repeating project without repeat interval', () => {
      it('should show an error notice', async () => {
        // Given
        const mockContext = { sourcePath: 'test.md' };
        mockFile.cache = {
          frontmatter: {
            'project/status': 'complete',
            'project/repeating': true,
            'project/due-date': '2024-01-15',
            'project/start-date': '2024-01-08'
          }
        };

        jest.spyOn(mockApp.vault, 'getAbstractFileByPath').mockReturnValue(mockFile);
        jest.spyOn(mockApp.metadataCache, 'getFileCache').mockReturnValue(mockFile.cache);
        const modifySpy = jest.spyOn(mockApp.vault, 'modify').mockResolvedValue();

        // When
        await plugin.repeatProject(mockContext);

        // Then
        // Should not call modify since there's no repeat interval
        expect(modifySpy).not.toHaveBeenCalled();
      });
    });

    describe('Given a repeating project with invalid repeat interval', () => {
      it('should handle the error gracefully', async () => {
        // Given
        const mockContext = { sourcePath: 'test.md' };
        mockFile.cache = {
          frontmatter: {
            'project/status': 'complete',
            'project/repeating': true,
            'project/repeat-interval': 'INVALID',
            'project/due-date': '2024-01-15',
            'project/start-date': '2024-01-08'
          }
        };

        jest.spyOn(mockApp.vault, 'getAbstractFileByPath').mockReturnValue(mockFile);
        jest.spyOn(mockApp.metadataCache, 'getFileCache').mockReturnValue(mockFile.cache);
        const modifySpy = jest.spyOn(mockApp.vault, 'modify').mockResolvedValue();

        // When
        await plugin.repeatProject(mockContext);

        // Then
        // Should not call modify since the interval is invalid
        expect(modifySpy).not.toHaveBeenCalled();
      });
    });
  });

});