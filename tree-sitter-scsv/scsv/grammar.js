/**
 * @file Semicolon-separated values grammar for tree-sitter
 *
 * Derived from https://github.com/tree-sitter-grammars/tree-sitter-csv
 * (MIT, Amaan Qureshi); only the dialect name and separator differ.
 */

const defineGrammar = require('../common/define-grammar');

module.exports = defineGrammar('scsv', ';');
