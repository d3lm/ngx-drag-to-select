import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { merge } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { KeyboardEventsService } from './keyboard-events.service';
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

interface KeyState {
  code: string;
  pressed: boolean;
}

@Injectable()
export class ShortcutService {
  private _shortcuts: { [key: string]: string[][] } = {};

  private _latestShortcut: Map<string, boolean> = new Map();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(CONFIG) config: DragToSelectConfig,
    private keyboardEvents: KeyboardEventsService
  ) {
    this._shortcuts = this._createShortcutsFromConfig(config.shortcuts);

    if (isPlatformBrowser(this.platformId)) {
      const keydown$ = this.keyboardEvents.keydown$.pipe(
        map<KeyboardEvent, KeyState>(event => ({ code: event.code, pressed: true }))
      );

      const keyup$ = this.keyboardEvents.keyup$.pipe(
        map<KeyboardEvent, KeyState>(event => ({ code: event.code, pressed: false }))
      );

      merge<KeyState>(keydown$, keyup$)
        .pipe(
          distinctUntilChanged((prev, curr) => {
            return prev.pressed === curr.pressed && prev.code === curr.code;
          })
        )
        .subscribe(keyState => {
          if (keyState.pressed) {
            this._latestShortcut.set(keyState.code, true);
          } else {
            this._latestShortcut.delete(keyState.code);
          }
        });
    }
  }

  disableSelection(event: Event) {
    return this._isShortcutPressed('disableSelection', event);
  }

  moveRangeStart(event: Event) {
    return this._isShortcutPressed('moveRangeStart', event);
  }

  toggleSingleItem(event: Event) {
    return this._isShortcutPressed('toggleSingleItem', event);
  }

  addToSelection(event: Event) {
    return this._isShortcutPressed('addToSelection', event);
  }

  removeFromSelection(event: Event) {
    return this._isShortcutPressed('removeFromSelection', event);
  }

  extendedSelectionShortcut(event: Event) {
    return this.addToSelection(event) || this.removeFromSelection(event);
  }

  private _createShortcutsFromConfig(shortcuts: { [key: string]: string }) {
    const shortcutMap = {};

    for (const [key, shortcutsForCommand] of Object.entries(shortcuts)) {
      if (!this._isSupportedShortcut(key)) {
        throw new Error(this._getErrorMessage(`Shortcut ${key} not supported`));
      }

      shortcutsForCommand
        .replace(/ /g, '')
        .split(',')
        .forEach(shortcut => {
          if (!shortcutMap[key]) {
            shortcutMap[key] = [];
          }

          const combo = shortcut.split('+');
          const cleanCombos = this._substituteKey(shortcut, combo, META_KEY);

          cleanCombos.forEach(cleanCombo => {
            const unsupportedKey = this._isSupportedCombo(cleanCombo);

            if (unsupportedKey) {
              throw new Error(this._getErrorMessage(`Key '${unsupportedKey}' in shortcut ${shortcut} not supported`));
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

  private _substituteKey(shortcut: string, combo: Array<string>, substituteKey: string) {
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

  private _getErrorMessage(message: string) {
    return `${ERROR_PREFIX} ${message}`;
  }

  private _isShortcutPressed(shortcutName: string, event: Event) {
    const shortcuts = this._shortcuts[shortcutName];

    return shortcuts.some(shortcut => {
      return shortcut.every(key => this._isKeyPressed(event, key));
    });
  }

  private _isKeyPressed(event: Event, key: string) {
    return key.startsWith('Key') ? this._latestShortcut.has(key) : event[key];
  }

  private _isSupportedCombo(combo: Array<string>) {
    let unsupportedKey = null;

    combo.forEach(key => {
      if (!SUPPORTED_META_KEYS[key] && (!SUPPORTED_KEYS.test(key) || this._isSingleChar(key))) {
        unsupportedKey = key;
        return;
      }
    });

    return unsupportedKey;
  }

  private _isSingleChar(key: string) {
    return key.length > 1;
  }

  private _isSupportedShortcut(shortcut: string) {
    return SUPPORTED_SHORTCUTS[shortcut];
  }
}
