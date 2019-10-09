import { Inject, Injectable } from '@angular/core';
import { DragToSelectConfig } from './models';
import { CONFIG } from './tokens';

const SUPPORTED_META_KEYS = {
  alt: true,
  shift: true,
  meta: true,
  ctrl: true
};

const SUPPORTED_KEYS = /[a-z]/;

const META_KEY = 'meta';

const KEY_ALIASES = {
  [META_KEY]: ['ctrl', 'meta']
};

const SUPPORTED_SHORTCUTS = {
  moveRangeStart: true,
  disableSelection: true,
  toggleSingleItem: true,
  addToSelection: true,
  removeFromSelection: true
};

const ERROR_PREFIX = '[ShortcutService]';

@Injectable()
export class ShortcutService {
  private _shortcuts: { [key: string]: string[][] } = {};

  constructor(@Inject(CONFIG) config: DragToSelectConfig) {
    this._shortcuts = this.createShortcutsFromConfig(config.shortcuts);
  }

  disableSelection(event: Event) {
    return this.isShortcutPressed('disableSelection', event);
  }

  moveRangeStart(mouseEvent: MouseEvent, keyboardEvent: KeyboardEvent) {
    return this.isShortcutPressed('moveRangeStart', mouseEvent, keyboardEvent);
  }

  toggleSingleItem(event: Event) {
    return this.isShortcutPressed('toggleSingleItem', event);
  }

  addToSelection(event: Event) {
    return this.isShortcutPressed('addToSelection', event);
  }

  removeFromSelection(event: Event) {
    return this.isShortcutPressed('removeFromSelection', event);
  }

  extendedSelectionShortcut(event: Event) {
    return this.addToSelection(event) || this.removeFromSelection(event);
  }

  private createShortcutsFromConfig(shortcuts: { [key: string]: string }) {
    const shortcutMap = {};

    for (const [key, shortcutsForCommand] of Object.entries(shortcuts)) {
      if (!this.isSupportedShortcut(key)) {
        throw new Error(this.getErrorMessage(`Shortcut ${key} not supported`));
      }

      shortcutsForCommand
        .replace(/ /g, '')
        .split(',')
        .forEach(shortcut => {
          if (!shortcutMap[key]) {
            shortcutMap[key] = [];
          }

          const combo = shortcut.split('+');
          const cleanCombos = this.substituteKey(shortcut, combo, META_KEY);

          cleanCombos.forEach(cleanCombo => {
            const unsupportedKey = this.isSupportedCombo(cleanCombo);

            if (unsupportedKey) {
              throw new Error(this.getErrorMessage(`Key '${unsupportedKey}' in shortcut ${shortcut} not supported`));
            }

            shortcutMap[key].push(
              cleanCombo.map(comboKey => {
                return SUPPORTED_META_KEYS[comboKey] ? `${comboKey}Key` : `Key${comboKey.toUpperCase()}`;
              })
            );
          });
        });
    }

    return shortcutMap;
  }

  private substituteKey(shortcut: string, combo: Array<string>, substituteKey: string) {
    const hasSpecialKey = shortcut.includes(substituteKey);
    const substitutedShortcut: string[][] = [];

    if (hasSpecialKey) {
      const cleanShortcut = combo.filter(element => element !== META_KEY);

      KEY_ALIASES.meta.forEach(alias => {
        substitutedShortcut.push([...cleanShortcut, alias]);
      });
    } else {
      substitutedShortcut.push(combo);
    }

    return substitutedShortcut;
  }

  private getErrorMessage(message: string) {
    return `${ERROR_PREFIX} ${message}`;
  }

  private isShortcutPressed(shortcutName: string, event: Event, keyboardEvent?: KeyboardEvent) {
    const shortcuts = this._shortcuts[shortcutName];

    return shortcuts.some(shortcut => {
      return shortcut.every(key => (key.startsWith('Key') && keyboardEvent ? keyboardEvent.code === key : event[key]));
    });
  }

  private isSupportedCombo(combo: Array<string>) {
    let unsupportedKey = null;

    combo.forEach(key => {
      if (!SUPPORTED_META_KEYS[key] && !SUPPORTED_KEYS.test(key)) {
        unsupportedKey = key;
        return;
      }
    });

    return unsupportedKey;
  }

  private isSupportedShortcut(shortcut: string) {
    return SUPPORTED_SHORTCUTS[shortcut];
  }
}
