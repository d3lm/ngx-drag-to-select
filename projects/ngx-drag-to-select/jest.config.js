module.exports = {
  preset: 'jest-preset-angular',
  rootDir: '../../',
  roots: ['<rootDir>/projects/ngx-drag-to-select'],
  setupTestFrameworkScriptFile: '<rootDir>/projects/ngx-drag-to-select/test.ts',
  globals: {
    'ts-jest': {
      tsConfigFile: './projects/ngx-drag-to-select/tsconfig.spec.json'
    },
    __TRANSFORM_HTML__: true
  }
};
