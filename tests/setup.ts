import { jest } from '@jest/globals';

// Mock DOM environment
global.document = {
  createElement: jest.fn((tagName: string) => ({
    tagName,
    classList: {
      add: jest.fn(),
    },
    addEventListener: jest.fn(),
    createEl: jest.fn((tagName: string, options?: any) => ({
      tagName,
      text: options?.text || '',
      value: options?.value || '',
      selected: false,
      addEventListener: jest.fn(),
    })),
    createDiv: jest.fn((options?: any) => ({
      tagName: 'div',
      cls: options?.cls || '',
      createEl: jest.fn((tagName: string, options?: any) => ({
        tagName,
        text: options?.text || '',
        value: options?.value || '',
        selected: false,
        addEventListener: jest.fn(),
      })),
      createDiv: jest.fn(),
      style: {},
    })),
    style: {},
  })),
} as any;

global.window = {
  setInterval: jest.fn(),
} as any;