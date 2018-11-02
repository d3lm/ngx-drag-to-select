<a name="3.0.0"></a>
# [3.0.0](https://github.com/d3lm/ngx-drag-to-select/compare/v2.1.0...v3.0.0) (2018-11-02)


### Bug Fixes

* **lib:** flush items when switching between selection modes ([1d753a9](https://github.com/d3lm/ngx-drag-to-select/commit/1d753a9))
* **lib:** only emit left mouse drag ([4a53fcc](https://github.com/d3lm/ngx-drag-to-select/commit/4a53fcc))
* **lib:** update selection on mouseup when switching between modes ([4c1a95e](https://github.com/d3lm/ngx-drag-to-select/commit/4c1a95e))


### Features

* add changelog script ([0a7c0e8](https://github.com/d3lm/ngx-drag-to-select/commit/0a7c0e8))
* **lib:** add classes for selection modes ([01a5129](https://github.com/d3lm/ngx-drag-to-select/commit/01a5129)), closes [#52](https://github.com/d3lm/ngx-drag-to-select/issues/52)
* **lib:** upgrade to angular 7 ([cc7cd3e](https://github.com/d3lm/ngx-drag-to-select/commit/cc7cd3e))


### BREAKING CHANGES

* **lib:** BEFORE:
It was possible to drag with all (left, right, middle) mouse buttons

AFTER:
It is only possible to drag with the left mouse button



<a name="2.1.0"></a>
# [2.1.0](https://github.com/d3lm/ngx-drag-to-select/compare/v2.0.0...v2.1.0) (2018-09-27)


### Bug Fixes

* formatting errors ([26eaa90](https://github.com/d3lm/ngx-drag-to-select/commit/26eaa90))


### Features

* upgrade dependencies ([8ca7881](https://github.com/d3lm/ngx-drag-to-select/commit/8ca7881)), closes [#39](https://github.com/d3lm/ngx-drag-to-select/issues/39)
* **lib:** ability to programatically select, deselect and toggle items ([e6d0cd8](https://github.com/d3lm/ngx-drag-to-select/commit/e6d0cd8)), closes [#46](https://github.com/d3lm/ngx-drag-to-select/issues/46)
* **lib:** add select and deselect output ([351e9e9](https://github.com/d3lm/ngx-drag-to-select/commit/351e9e9)), closes [#35](https://github.com/d3lm/ngx-drag-to-select/issues/35)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/d3lm/ngx-drag-to-select/compare/v1.1.1...v2.0.0) (2018-07-22)


### Bug Fixes

* organize imports ([65bac60](https://github.com/d3lm/ngx-drag-to-select/commit/65bac60))
* prevent error when clicking on the container on first load ([67ecd7e](https://github.com/d3lm/ngx-drag-to-select/commit/67ecd7e))
* remove peer dependency on cdk ([9dd10e8](https://github.com/d3lm/ngx-drag-to-select/commit/9dd10e8))
* **app:** add margin between github buttons ([0e65684](https://github.com/d3lm/ngx-drag-to-select/commit/0e65684))
* **app:** breakpoints are now correctly matched ([f8991fd](https://github.com/d3lm/ngx-drag-to-select/commit/f8991fd))
* **lib:** add unit test for select-container ([81fc9e6](https://github.com/d3lm/ngx-drag-to-select/commit/81fc9e6))
* **lib:** select mode ([b7bd0d8](https://github.com/d3lm/ngx-drag-to-select/commit/b7bd0d8))


### Features

* add way of toggling items with shortcut click only ([03e98eb](https://github.com/d3lm/ngx-drag-to-select/commit/03e98eb))
* expose update as part of the public api ([ae63c32](https://github.com/d3lm/ngx-drag-to-select/commit/ae63c32))
* migrate to Angular CLI lib project ([04d6825](https://github.com/d3lm/ngx-drag-to-select/commit/04d6825))
* upgrade to Angular 6 ([bfcec35](https://github.com/d3lm/ngx-drag-to-select/commit/bfcec35))
* **lib:** change component and directive prefix to dts ([b5d31fd](https://github.com/d3lm/ngx-drag-to-select/commit/b5d31fd)), closes [#32](https://github.com/d3lm/ngx-drag-to-select/issues/32)


### BREAKING CHANGES

* **lib:** ngx-select-container is now dts-select-container and
selectItem is now dtsSelectItem. Similarly, the input property from the
dtsSelectItem directive was changed to match the directive name.



<a name="1.1.1"></a>
## [1.1.1](https://github.com/d3lm/ngx-drag-to-select/compare/v1.1.0...v1.1.1) (2018-04-06)


### Bug Fixes

* **app:** remove absolute path for assets ([7d4c890](https://github.com/d3lm/ngx-drag-to-select/commit/7d4c890))
* **app:** remove vertical scroll bars from smartphone ([eb1662c](https://github.com/d3lm/ngx-drag-to-select/commit/eb1662c))
* **app:** use relative path for svg inside component stylesheet ([d462765](https://github.com/d3lm/ngx-drag-to-select/commit/d462765))
* **lib:** emit empty array after proxy was revoked ([f68dc57](https://github.com/d3lm/ngx-drag-to-select/commit/f68dc57))


### Features

* **app:** make it responsive ([5faabd3](https://github.com/d3lm/ngx-drag-to-select/commit/5faabd3)), closes [#13](https://github.com/d3lm/ngx-drag-to-select/issues/13)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/d3lm/ngx-drag-to-select/compare/v1.0.6...v1.1.0) (2018-04-06)


### Features

* **lib:** add mobile features ([77fd339](https://github.com/d3lm/ngx-drag-to-select/commit/77fd339)), closes [#12](https://github.com/d3lm/ngx-drag-to-select/issues/12)



<a name="1.0.6"></a>
## [1.0.6](https://github.com/d3lm/ngx-drag-to-select/compare/v1.0.5...v1.0.6) (2018-04-05)


### Bug Fixes

* **lib:** properly initialize bounding client rect ([8c9b091](https://github.com/d3lm/ngx-drag-to-select/commit/8c9b091))



<a name="1.0.5"></a>
## [1.0.5](https://github.com/d3lm/ngx-drag-to-select/compare/v1.0.4...v1.0.5) (2018-04-05)


### Bug Fixes

* **lib:** cross-browser scroll ([5f02cf8](https://github.com/d3lm/ngx-drag-to-select/commit/5f02cf8))
* **lib:** rework positioning of selection box ([9a817df](https://github.com/d3lm/ngx-drag-to-select/commit/9a817df)), closes [#8](https://github.com/d3lm/ngx-drag-to-select/issues/8)



<a name="1.0.4"></a>
## [1.0.4](https://github.com/d3lm/ngx-drag-to-select/compare/v1.0.3...v1.0.4) (2018-04-03)


### Bug Fixes

* **lib:** add missing import ([57d89e8](https://github.com/d3lm/ngx-drag-to-select/commit/57d89e8))
* **lib:** selection rectangle ([3d0de15](https://github.com/d3lm/ngx-drag-to-select/commit/3d0de15)), closes [#7](https://github.com/d3lm/ngx-drag-to-select/issues/7)


### Features

* **lib:** add ability to disable selection per input property ([663653c](https://github.com/d3lm/ngx-drag-to-select/commit/663653c))



<a name="1.0.3"></a>
## [1.0.3](https://github.com/d3lm/ngx-drag-to-select/compare/v1.0.1...v1.0.3) (2018-03-31)


### Bug Fixes

* **lib:** misalignment of selection rectangle ([d383cfc](https://github.com/d3lm/ngx-drag-to-select/commit/d383cfc)), closes [#4](https://github.com/d3lm/ngx-drag-to-select/issues/4)



<a name="1.0.1"></a>
## [1.0.1](https://github.com/d3lm/ngx-drag-to-select/compare/v1.0.0...v1.0.1) (2018-03-31)



<a name="1.0.0"></a>
# [1.0.0](https://github.com/d3lm/ngx-drag-to-select/compare/80d54f6...v1.0.0) (2018-03-30)


### Bug Fixes

* e2e tests ([0881100](https://github.com/d3lm/ngx-drag-to-select/commit/0881100))
* **app:** incorrect path for svg icons ([01e1954](https://github.com/d3lm/ngx-drag-to-select/commit/01e1954))
* **lib:** default value for input ([a914583](https://github.com/d3lm/ngx-drag-to-select/commit/a914583))
* **lib:** sass file name ([4b7bb03](https://github.com/d3lm/ngx-drag-to-select/commit/4b7bb03))


### Features

* add scripts to build for gh-pages ([5692924](https://github.com/d3lm/ngx-drag-to-select/commit/5692924))
* add ssr and pre-rendering ([80d54f6](https://github.com/d3lm/ngx-drag-to-select/commit/80d54f6))



