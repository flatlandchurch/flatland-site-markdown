'use strict';
const loadJSON = require('load-json-file');

module.exports = async () => loadJSON('.dependency_tree.json');
