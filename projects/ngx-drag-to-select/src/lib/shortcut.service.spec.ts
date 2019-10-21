import { TestBed } from '@angular/core/testing';
import { KeyboardEventsService } from './keyboard-events.service';
import { ShortcutService } from './shortcut.service';
import { CONFIG } from './tokens';

describe('ShortcutService', () => {
  let shortcutService: ShortcutService;

  describe('Exceptions', () => {
    it('should throw an error for using an unsupported key', () => {
      const config = {
        shortcuts: {
          disableSelection: 'foo'
        }
      };

      TestBed.configureTestingModule({
        providers: [KeyboardEventsService, ShortcutService, { provide: CONFIG, useValue: config }]
      });

      expect(() => {
        TestBed.get(ShortcutService);
      }).toThrowError(`[ShortcutService] Key 'foo' in shortcut foo not supported`);
    });

    it('should throw an error when using an unsupported shortcut', () => {
      const config = {
        shortcuts: {
          foo: 'bar'
        }
      };

      TestBed.configureTestingModule({
        providers: [KeyboardEventsService, ShortcutService, { provide: CONFIG, useValue: config }]
      });

      expect(() => {
        TestBed.get(ShortcutService);
      }).toThrowError(`[ShortcutService] Shortcut foo not supported`);
    });
  });

  describe('Shortcuts', () => {
    const CUSTOM_CONFIG = {
      shortcuts: {
        disableSelection: 'alt+meta',
        toggleSingleItem: 'meta',
        addToSelection: 'shift',
        removeFromSelection: 'shift+meta,alt+shift'
      }
    };

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [KeyboardEventsService, ShortcutService, { provide: CONFIG, useValue: CUSTOM_CONFIG }]
      });

      shortcutService = TestBed.get(ShortcutService);
    });

    describe('disableSelection', () => {
      it('should substitute meta for ctrl and meta', () => {
        let mouseEvent = { altKey: true, ctrlKey: true } as MouseEvent;
        expect(shortcutService.disableSelection(mouseEvent)).toBe(true);

        mouseEvent = { altKey: true, metaKey: true } as MouseEvent;
        expect(shortcutService.disableSelection(mouseEvent)).toBe(true);

        mouseEvent = { altKey: true, metaKey: true, ctrlKey: true } as MouseEvent;
        expect(shortcutService.disableSelection(mouseEvent)).toBe(true);
      });

      it('should be false when only one key is pressed', () => {
        let mouseEvent = { altKey: true, ctrlKey: false, metaKey: false } as MouseEvent;
        expect(shortcutService.disableSelection(mouseEvent)).toBe(false);

        mouseEvent = { altKey: false, ctrlKey: true, metaKey: false } as MouseEvent;
        expect(shortcutService.disableSelection(mouseEvent)).toBe(false);

        mouseEvent = { altKey: false, ctrlKey: false, metaKey: true } as MouseEvent;
        expect(shortcutService.disableSelection(mouseEvent)).toBe(false);
      });

      it('should be false for all other keys', () => {
        const mouseEvent = { altKey: false, ctrlKey: false, metaKey: false, shiftKey: true } as MouseEvent;
        expect(shortcutService.disableSelection(mouseEvent)).toBe(false);
      });
    });

    describe('toggleSingleItem', () => {
      it('should substitute meta for ctrl and meta', () => {
        let mouseEvent = { ctrlKey: true, metaKey: false } as MouseEvent;
        expect(shortcutService.toggleSingleItem(mouseEvent)).toBe(true);

        mouseEvent = { ctrlKey: false, metaKey: true } as MouseEvent;
        expect(shortcutService.toggleSingleItem(mouseEvent)).toBe(true);

        mouseEvent = { ctrlKey: true, metaKey: true } as MouseEvent;
        expect(shortcutService.toggleSingleItem(mouseEvent)).toBe(true);
      });

      it('should be false for all other keys', () => {
        const mouseEvent = { ctrlKey: false, metaKey: false, shiftKey: true, altKey: true } as MouseEvent;
        expect(shortcutService.toggleSingleItem(mouseEvent)).toBe(false);
      });
    });

    describe('addToSelection', () => {
      it('should be true when shift is pressed', () => {
        const mouseEvent = { shiftKey: true } as MouseEvent;
        expect(shortcutService.addToSelection(mouseEvent)).toBe(true);
      });

      it('should be false for all other keys', () => {
        const mouseEvent = { shiftKey: false, ctrlKey: true, metaKey: true, altKey: true } as MouseEvent;
        expect(shortcutService.addToSelection(mouseEvent)).toBe(false);
      });
    });

    describe('removeFromSelection', () => {
      it('should substitute meta for ctrl and meta', () => {
        let mouseEvent = { shiftKey: true, ctrlKey: true } as MouseEvent;
        expect(shortcutService.removeFromSelection(mouseEvent)).toBe(true);

        mouseEvent = { shiftKey: true, metaKey: true } as MouseEvent;
        expect(shortcutService.removeFromSelection(mouseEvent)).toBe(true);

        mouseEvent = { shiftKey: true, ctrlKey: true, metaKey: true } as MouseEvent;
        expect(shortcutService.removeFromSelection(mouseEvent)).toBe(true);
      });

      it('should be true when alt and shift is pressed', () => {
        const mouseEvent = { altKey: true, shiftKey: true } as MouseEvent;
        expect(shortcutService.removeFromSelection(mouseEvent)).toBe(true);
      });

      it('should be false when only one key is pressed', () => {
        let mouseEvent = { shiftKey: true, metaKey: false, ctrlKey: false, altKey: false } as MouseEvent;
        expect(shortcutService.removeFromSelection(mouseEvent)).toBe(false);

        mouseEvent = { shiftKey: false, metaKey: true, ctrlKey: false, altKey: false } as MouseEvent;
        expect(shortcutService.removeFromSelection(mouseEvent)).toBe(false);

        mouseEvent = { shiftKey: false, metaKey: false, ctrlKey: true, altKey: false } as MouseEvent;
        expect(shortcutService.removeFromSelection(mouseEvent)).toBe(false);

        mouseEvent = { shiftKey: false, metaKey: false, ctrlKey: false, altKey: true } as MouseEvent;
        expect(shortcutService.removeFromSelection(mouseEvent)).toBe(false);
      });

      it('should be false for all other keys', () => {
        const mouseEvent = { shiftKey: false, metaKey: false, ctrlKey: false, altKey: true } as MouseEvent;
        expect(shortcutService.removeFromSelection(mouseEvent)).toBe(false);
      });
    });

    describe('extendedSelectionShortcut', () => {
      it('should be true when shift + meta is pressed', () => {
        let mouseEvent = { shiftKey: true, ctrlKey: true } as MouseEvent;
        expect(shortcutService.extendedSelectionShortcut(mouseEvent)).toBe(true);

        mouseEvent = { shiftKey: true, metaKey: true } as MouseEvent;
        expect(shortcutService.extendedSelectionShortcut(mouseEvent)).toBe(true);

        mouseEvent = { shiftKey: true, metaKey: true, ctrlKey: true } as MouseEvent;
        expect(shortcutService.extendedSelectionShortcut(mouseEvent)).toBe(true);
      });

      it('should be true when alt + shift is pressed', () => {
        let mouseEvent = { shiftKey: true, altKey: true } as MouseEvent;
        expect(shortcutService.extendedSelectionShortcut(mouseEvent)).toBe(true);

        mouseEvent = { shiftKey: false, altKey: true, ctrlKey: true } as MouseEvent;
        expect(shortcutService.extendedSelectionShortcut(mouseEvent)).toBe(false);
      });

      it('should be true when only shift is pressed', () => {
        const mouseEvent = { shiftKey: true, metaKey: false } as MouseEvent;
        expect(shortcutService.extendedSelectionShortcut(mouseEvent)).toBe(true);
      });

      it('should be false when only meta is pressed', () => {
        const mouseEvent = { shiftKey: false, metaKey: true } as MouseEvent;
        expect(shortcutService.extendedSelectionShortcut(mouseEvent)).toBe(false);
      });
    });
  });
});
