# ngx-drag-to-select

[![travis](https://img.shields.io/travis/d3lm/ngx-drag-to-select/master.svg?label=Travis%20CI)](https://travis-ci.org/d3lm/ngx-drag-to-select)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![npm](https://img.shields.io/npm/v/ngx-drag-to-select.svg)](https://www.npmjs.com/package/ngx-drag-to-select)
[![npm License](https://img.shields.io/npm/l/ngx-drag-to-select.svg)](https://github.com/d3lm/ngx-drag-to-select/blob/master/LICENSE)

A lightweight, fast, configurable and reactive drag-to-select component for Angular 5 and beyond

## Demo

[Live Demo](https://d3lm.github.io/ngx-drag-to-select/)

## Playground

You can also fiddle with the library using [StackBlitz](https://stackblitz.com/edit/ngx-drag-to-select?file=app%2Fpages%2Fhome%2Fhome.component.html). Credits for the template go to [Bram Borggreve](https://twitter.com/beeman_nl).

## Features

* Drag to Select
* Shortcuts
* Customizable 💅
* Lightweight
* Easy to use
* Ready for AoT and SSR
* Complies with the [Angular Package Format](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview)
* Includes FESM2015, FESM5, and UMD bundles 📦
* It's fast 🏎
* Mobile friendly 📱
* Thoroughly tested 🚨

## Examples

* [Desktop Example](https://github.com/d3lm/ngx-drag-to-select/blob/master/src/app): Check out the `AppComponent`!
* [Mobile Example](https://github.com/d3lm/ngx-drag-to-select/blob/master/src/app/phone): There's a dedicated `PhoneComponent` component that uses all the tools and features from this library to implement a Google Inbox-like selection experience.

## Installation

```
npm install ngx-drag-to-select
```

or

```
yarn add ngx-drag-to-select
```

## Setup

Setting up `ngx-drag-to-select` is easy, and it only takes a few steps!

### Adding the CSS

The first step is to add the CSS and for that you have two options. Either you use the **default styles** or you can import the `ngx-drag-to-select` sass package directly. The latter gives you the option to override variables and customize for instance the look and feel of the selection rectangle.

**Using the default styles**

Copy `ngx-drag-to-select.css` to your project and add it as a `style` tag to your `index.html`.

If you are using sass you can import the css as follows:

```
@import "~ngx-drag-to-select/ngx-drag-to-select.css";
```

If you are using the [Angular CLI](https://github.com/angular/angular-cli) you can add it to your `.angular-cli.json`

```
"styles": [
  "styles.scss",
  "../node_modules/ngx-drag-to-select/ngx-drag-to-select.css"
]
```

**Using the sass package**

If you're using sass you can simply import the sass package. This allows you to [override the default variables](#overriding-sass-variables) to customize the library to your needs.

```
@import "~ngx-drag-to-select/scss/ngx-drag-to-select";
```

### Adding the module

In your `AppModule` import `DragToSelectModule` from `ngx-drag-to-select` and add it to the module imports:

```
import { DragToSelectModule } from 'ngx-drag-to-select';

@NgModule({
  imports: [
    DragToSelectModule.forRoot()
  ]
})
export class AppModule { }
```

That's it. You are now ready to use this library in your project. Make sure to call `forRoot()` only **once** in your `AppModule` and for feature modules you simply add the `DragToSelectModule` as is **without** calling `forRoot()`.

## Usage

Once you have installed the library and added the `DragToSelectModule` to your application you are ready to go.

Anywhere in your template add the `ngx-select-container` component and wrap all items that you want to be selectable in this component.

Next, mark all selectable items with the `selectItem` directive. This connects each item with the container component.

Here's a complete example:

```
<ngx-select-container #container="ngx-select-container" [(selectedItems)]="selectedDocuments" (select)="someMethod($event)">
  <ul>
    <li [selectItem]="document" *ngFor="let document of documents">{{ document.name }}</li>
  </ul>
</ngx-select-container>
```

## Configuration Options

This section gives you an overview of things you can customize and configure.

### Overriding sass variables

You can override the following variables:

| Variable                      | Type    | Default   | Description                                       |
| ----------------------------- | ------- | --------- | ------------------------------------------------- |
| `$select-box-color`           | Color   | `#7ddafc` | Color of the selection rectangle                  |
| `$select-box-border-size`     | Unit    | `2px`     | Border size for the selection rectangle           |
| `$selected-item-border`       | Boolean | `true`    | Whether the selected item should get a border     |
| `$selected-item-border-color` | Color   | `#d2d2d2` | Border color of the selected item                 |
| `$selected-item-border-size`  | Unit    | `1px`     | Border size of the selected item                  |
| `$box-shadow`                 | Boolean | `true`    | Whether the selected item should get a box shadow |

If you wish to override one of these variables, make sure to do that **before** you import the sass package.

Example:

```
// Example for overriding the color of the selection retangle
$select-box-color: red;

@import "~ngx-drag-to-select/scss/ngx-drag-to-select";
```

Keep in mind that default styles are applied to all drag-to-select instances in your application. This means that if you override the color of the select box and set it so something like `red` then all instances render a `red` selection rectangle.

### Configuring `DragToSelectModule`

This library allows to you override certain options, such as

**`selectedClass`** (String)

Class that is added to an item when it's selected. The default class is `selected`. Note that if you override this option, you'll lose the default styling and must take care of this yourself.

**`shortcuts`** (Object)

`ngx-drag-to-select` supports a hand full of shortcuts to make our live easier when selecting items.

| Shortcut            | Default          | Description                                                                       |
| ------------------- | ---------------- | --------------------------------------------------------------------------------- |
| disableSelection    | `alt`            | Disable selection mode to allow selecting text on the screen within the drag area |
| toggleSingleItem    | `meta`           | Add or remove single item to / from selection                                     |
| addToSelection      | `shift`          | Add items to selection                                                            |
| removeFromSelection | `shift` + `meta` | Remove items from selection                                                       |

You can override these options by passing a configuration object to `forRoot()`.

Here's an example:

```
import { DragToSelectModule } from 'ngx-drag-to-select';

@NgModule({
  imports: [
    DragToSelectModule.forRoot({
      selectedClass: 'my-selected-item',
      shortcuts: {
        disableSelection: ''
      }
    })
  ]
})
export class AppModule { }
```

When overriding the default shortcuts you can use the following modifier keys:

**`shift`**
**`alt`**
**`ctrl`**
**`meta`**

When using `meta`, it will be substituted with `ctrl` (for Windows) **and** `cmd` (for Mac). This allows for cross-platform shortcuts.

**Note**: If you override one of the shortscut you have to make sure they do not interfear with one another to ensure a smooth selecting experience.

## API

`ngx-drag-to-select` comes with two main building blocks, a `ngx-select-container` component and a `selectItem` directive.

### `ngx-select-container`

**Inputs**

| Input         | Type       | Default | Description                                                                                                   |
| ------------- | ---------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| selectedItems | Array<any> | /       | Collection of items that are currently selected                                                               |
| selectOnDrag  | Boolean    | `true`  | Whether items should be selected while dragging                                                               |
| disabled      | Boolean    | `false` | Disable selection                                                                                             |
| disableDrag   | Boolean    | `false` | Disable selection by dragging with the mouse. May be useful for mobile.                                       |
| selectMode    | Boolean    | `false` | If set to `true`, a _toggle_ mode is activated similar to the `toggleSingleItem` shortcut. Useful for mobile. |
| custom        | Boolean    | `false` | If set to `true`, all default styles for selected items will not be applied.                                  |

Here's an example of all inputs in action:

```
<ngx-select-container
  [(selectedItems)]="selectedDocuments"
  [selectOnDrag]="selectOnDrag"
  [disabled]="false"
  [disableDrag]="true"
  [selectMode]="true"
  [custom]="true">
  ...
</ngx-select-container>
```

* To get ahold of the selected items you can use a two-way data binding (`[()]`) aka _banana-in-the-box_ syntax. This means that whenever the selection changes, your property is updated accordingly. It will always reflect the current selection.

* Binding an expression to `selectOnDrag` will override the default value. When this option is set to `false`, it will **increase the performance** but you'll trade this for a slighly worse user experience.

**Outputs**

| Input  | Payload Type | Description                                                                                                    |
| ------ | ------------ | -------------------------------------------------------------------------------------------------------------- |
| select | Array<any>   | Event that is fired whenever the selection changes. The payload (`$event`) will be the list of selected items. |

Example:

```
<ngx-select-container (select)="someMethod($event)">
  ...
</ngx-select-container>
```

**Public Methods**

| Methods        | Description                           |
| -------------- | ------------------------------------- |
| selectAll      | Select all items within the drag area |
| clearSelection | Clear current selection               |

To access these methods on the container component you can either use the `@ViewChild()` decorator

```
import { Component, ViewChild } from '@angular/core';
import { SelectContainerComponent } from 'ngx-drag-to-select';

@Component({
  ...
})
export class AppComponent {
  @ViewChild(SelectContainerComponent) selectContainer: SelectContainerComponent;

  someMethod() {
    this.selectContainer.clearSelection();
  }
}
```

or use it within the template with a template reference variable

```
<button (click)="selectContainer.selectAll()">Select All</button>
<button (click)="selectContainer.clearSelection()">Clear Selection</button>

<ngx-select-container #selectContainer="ngx-select-container" [(selectedItems)]="selectedDocuments">
  ...
</ngx-select-container>
```

> What if I want to use the `@ViewChild()` decorator but have multiple instances of the `ngx-select-container` in my template?

In that case I would recommend to add template reference variables to your select containers and query them one by one using the variable name.

Here's an example:

```
<ngx-select-container #documents>
  ...
</ngx-select-container>

...

<ngx-select-container #images>
  ...
</ngx-select-container>
```

In the component you can then query them one by one:

```
import { Component, ViewChild } from '@angular/core';
import { SelectContainerComponent } from 'ngx-drag-to-select';

@Component({
  ...
})
export class AppComponent {
  @ViewChild('documents') documentContainer: SelectContainerComponent;
  @ViewChild('images') imagesContainer: SelectContainerComponent;

  someMethod() {
    this.documentContainer.clearSelection();
  }

  someOtherMethod() {
    this.imagesContainer.selectAll();
  }
}
```

### `selectItem`

The `selectItem` directive is used to mark DOM elements as selectable items. It takes an input to control the value that is used when the item was selected. If the input is not specified, it will use the directive instance as a default value.

**Inputs**

| Input      | Type | Default            | Description                                  |
| ---------- | ---- | ------------------ | -------------------------------------------- |
| selectItem | any  | Directive Instance | Value that is used when the item is selected |

Example:

```
<ngx-select-container>
  <ul>
    <li [selectItem]="document" *ngFor="let document of documents">{{ document.name }}</li>
  </ul>
</ngx-select-container>
```

**Public Properties**

| Methods  | Type    | Description                         |
| -------- | ------- | ----------------------------------- |
| selected | Boolean | Whether the item is selected or not |

You can access this property in a similar why you access methods on the `select-container` component using either a template reference variable or programmatically with the `@ViewChild()` decorator.

Example:

```
<ngx-select-container>
  <ul>
    <li [selectItem]="document" #item *ngFor="let document of documents">
      {{ document.name }}
      <i class="fa fa-check" *ngIf="item.selected"></i>
    </li>
  </ul>
</ngx-select-container>
```

## Want to contribute?

If you want to file a bug, contribute some code, or improve our documentation, read up on our [contributing guidelines](CONTRIBUTING.md) and [code of conduct](CODE_OF_CONDUCT.md), and check out [open issues](/issues).

## For developers

If you want to set up `ngx-drag-to-select` on your machine for development, head over to our [developers guide](DEVELOPERS_GUIDE.md) and follow the described instructions.

## Versioning

`ngx-drag-to-select` will be maintained under the Semantic Versioning guidelines. Releases are numbered with the following format:

```
<MAJOR>.<MINOR>.<PATCH>
```

1.  **MAJOR** versions indicate incompatible API changes,
2.  **MINOR** versions add functionality in a backwards-compatible manner, and
3.  **PATCH** versions introduce backwards-compatible bug fixes.

For more information on SemVer, please visit [http://semver.org](http://semver.org).

## Licence

MIT © [Dominic Elm](http://github.com/d3lm)
