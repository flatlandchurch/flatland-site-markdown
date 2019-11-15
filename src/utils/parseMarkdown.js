'use strict';
const fs = require('graceful-fs');
const { promisify } = require('util');
const fm = require('front-matter');
const parseHTML = require('html-attribute-parser');
const catchify = require('catchify');
const markdown = require('remark-parse');

/**
 * parseMarkdown takes a document filepath and returns
 * a set of metadata and a body array which will contain
 * either the parsed markdown string or a parsed
 * component.
 *
 * parseMarkdown is intended to be used by a renderer
 * to place a document's contents/components into a
 * template.
 */
module.exports = async (filepath) => {
  const [err, file] = await catchify(promisify(fs.readFile)(filepath, 'utf-8'));

  if (err) {
    return 'DELETED';
  }

  const { attributes, body } = fm(file);
  const parser = new markdown.Parser(null, body);
  const document = parser.parse();

  document.children = document.children.reduce((acc, child) => {
    if (child.type === 'code') {
      if (child.lang !== 'json') {
        return acc;
      }

      acc.push({
        type: 'ld+json',
        value: JSON.parse(child.value),
      });
      return acc;
    }

    if (child.type === 'html') {
      const { tagName, attributes } = parseHTML(child.value.trim());
      acc.push({
        type: 'component',
        name: tagName,
        attributes,
      });
      return acc;
    }

    acc.push(child);
    return acc;
  }, []);

  return {
    meta: attributes,
    body: document,
  };
};
