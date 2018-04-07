module.exports = {
  extends: ['@commitlint/config-angular'],
  rules: {
    'subject-max-length': [1, 'always', 72],
    'scope-empty': [1, 'never'],
    'scope-enum': [2, 'always', ['app', 'lib']],
    'scope-case': [2, 'always', 'lowerCase'],
    'type-enum': [
      2,
      'always',
      ['build', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'release', 'revert', 'style', 'test']
    ]
  }
};
