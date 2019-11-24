'use strict';
const fs = require('graceful-fs');
const path = require('path');
const { promisify } = require('util');
const prettier = require('prettier');

const prettify = (source) => prettier.format(source, { parser: 'html' });

const regexpr = /content\/(.*)\.md/g;

// TODO: this needs to be better parsed through
module.exports = (dest, rendered, changes) => Promise.all(rendered.map(async (r, idx) => {
  if (!r) return;

  const titleRegex = new RegExp(regexpr);
  const [, file] = titleRegex.exec(changes[idx].path);
  const filename = `${file}.html`;

  await promisify(fs.writeFile)(path.join(dest, filename), prettify(r));
}));
