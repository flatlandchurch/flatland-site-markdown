'use strict';
const fs = require('graceful-fs');
const path = require('path');
const { promisify } = require('util');
const prettier = require('prettier');
const mkdir = require('make-dir');
const rimraf = require('rimraf');

const prettify = (source) => prettier.format(source, { parser: 'html' });

const getFilePath = ({ type, path }) => {
  const regexpr = /content\/.*\/(.*)\.md/g;
  const [, filename] = regexpr.exec(path) || [];

  if (!filename) throw new Error(`No filename could be parsed from "${path}"`);

  return `${type}/${filename}.html`;
};

module.exports = (destDir) => async (changes) => {
  if (changes.action === 'deleted') {
    rimraf(path.join(destDir, getFilePath(changes)));
    return;
  }

  const { rendered, body, ...rest } = changes;

  const html = prettify(changes.rendered);
  const filepath = getFilePath(rest);

  await mkdir(path.join(destDir, rest.type));

  await promisify(fs.writeFile)(path.join(destDir, filepath), html);
};
