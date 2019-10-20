'use strict';
const path = require('path');
const callsite = require('callsite');
const fs = require('graceful-fs');
const { promisify } = require('util');

module.exports = (fp) => {
  const stack = callsite();
  const dir = path.dirname(stack[1].getFileName());
  return promisify(fs.readFile)(path.join(dir, fp), 'utf-8');
};
