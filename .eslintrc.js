/**
 *  IMPORTANT NOTE!

 * create-react-app as of Nov 22, 2018 does not respect .eslintrc
 * files. react-app-rewire-less injects these rules into
 * create-react-app, and requires a hard-restart of the server
 * to update eslint rules in the react-app server
 */
export const options = {
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
      },
    },
  },
  extends: ['prettier'],
  rules: {
    'array-bracket-spacing': [1, 'never'],
    'block-spacing': [1, 'always'],
    'comma-dangle': [1, 'always-multiline'],
    'eqeqeq': 0,
    'no-console': 0,
    'no-debugger': 1,
    'no-empty': [1, { allowEmptyCatch: true }],
    'no-lonely-if': 1,
    'no-mixed-spaces-and-tabs': 1,
    'no-multi-spaces': [1, { ignoreEOLComments: true, exceptions: { Property: false } }],
    'no-multiple-empty-lines': [1, { max: 2, maxEOF: 0, maxBOF: 0 }],
    'no-param-reassign': [1, { ignorePropertyModificationsFor: ['a'] }], // NOTE: ignorePropertyModificationsFor doesn't work in our version of eslint
    'no-trailing-spaces': 1,
    'no-undef': [2, { typeof: true }],
    'no-unused-vars': [1, { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],
    'no-var': 1,
    'prettier/prettier': 1,
    'padding-line-between-statements': [
      1,
      { blankLine: 'always', prev: '*', next: '*' },
      { blankLine: 'never', prev: 'import', next: 'import' },
      { blankLine: 'never', prev: 'singleline-const', next: 'singleline-const' },
      { blankLine: 'never', prev: 'singleline-let', next: 'singleline-let' },
    ],
    'quotes': [1, 'single', { avoidEscape: true }],
    'semi': [1, 'never'],
    'space-before-blocks': [1, 'always'],
    'space-before-function-paren': [1, { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
    'space-in-parens': [1, 'never'],
    'space-infix-ops': [1, { int32Hint: false }],
  },
  plugins: ['prettier'],
  env: {
    node: true,
  },
}
