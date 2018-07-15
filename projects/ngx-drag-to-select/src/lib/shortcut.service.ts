import { Injectable, Inject } from '@angular/core';
import { DragToSelectConfig } from './models';
import { CONFIG } from './tokens';

const SUPPORTED_KEYS = {
  alt: true,
  shift: true,
  meta: true,
  ctrl: true
};

const META_KEY = 'meta';

const KEY_ALIASES = {
  [META_KEY]: ['ctrl', 'meta']
};

const SUPPORTED_SHORTCUTS = {
  disableSelection: true,
  toggleSingleItem: true,
  addToSelection: true,
  removeFromSelection: true
};

const ERROR_PREFIX = '[ShortcutService]';

@Injectable()
export class ShortcutService {
  private _shortcuts: { [key: string]: string[][] } = {};

  constructor(@Inject(CONFIG) private config: DragToSelectConfig) {
    this._shortcuts = this.createShortcutsFromConfig(config.shortcuts);
  }

  disableSelection(event: MouseEvent) {
    return this.isShortcutPressed('disableSelection', event);
  }

  toggleSingleItem(event: MouseEvent) {
    return this.isShortcutPressed('toggleSingleItem', event);
  }

  addToSelection(event: MouseEvent) {
    return this.isShortcutPressed('addToSelection', event);
  }

  removeFromSelection(event: MouseEvent) {
    return this.isShortcutPressed('removeFromSelection', event);
  }

  extendedSelectionShortcut(event: MouseEvent) {
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

            shortcutMap[key].push(cleanCombo.map(comboKey => `${comboKey}Key`));
          });
        });
    }

    return shortcutMap;
  }

  private substituteKey(shortcut: string, combo: Array<string>, substituteKey: string) {
    const hasSpecialKey = shortcut.includes(substituteKey);
    const substitutedShortcut = [];

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

  private isShortcutPressed(shortcutName: string, event: MouseEvent) {
    const shortcuts = this._shortcuts[shortcutName];

    return shortcuts.some(shortcut => {
      return shortcut.every(key => event[key]);
    });
  }

  private isSupportedCombo(combo: Array<string>) {
    let unsupportedKey = null;

    combo.forEach(key => {
      if (!SUPPORTED_KEYS[key]) {
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
