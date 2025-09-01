// src/test-setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Set up DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.document = dom.window.document;
global.window = dom.window as any;
global.navigator = dom.window.navigator;

// Make vi available globally
(global as any).vi = vi;