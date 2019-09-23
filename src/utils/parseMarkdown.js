'use strict';
const marked = require('marked');
const fs = require('graceful-fs');
const { promisify } = require('util');
const fm = require('front-matter');
const execall = require('execall');

const componentRegexp = /<(.*)\/>/g;

marked.setOptions({
  gfm: true,
  breaks: true,
  smartLists: true,
  smartypants: true,
});

const parseComponent = (str) => {
  const regexp = /(^")|("$)/g;

  const componentStr = str.trim();
  const [name, ...attrs] = componentStr.split(' ');

  const attributes = attrs.reduce((acc, attr) => {
    const [k, v] = attr.split('=');
    acc[k] = v.replace(regexp, '');
    return acc;
  }, {});
  return {
    type: 'component',
    name,
    attributes,
  };
};

/**
 * parseMarkdown takes a document filepath and returns
 * a set of metadata and a body array which will contain
 * either the parsed markdown string or a parsed
 * component.
 *
 * parseMarkdown is intended to be used by a renderer
 * to place a document's contents/components into a
 * template.
 *
 * @param filepath
 * @returns {Promise<{
 *  meta: {},
 *  body: [string | {}]
 * }>}
 */
module.exports = async (filepath) => {
  const file = await promisify(fs.readFile)(filepath, 'utf-8');
  const { attributes, body } = fm(file);
  const components = execall(componentRegexp, body);

  const data = {
    meta: attributes,
  };

  if (!components.length) {
    data.body = [marked(body)];
  } else {
    data.body = [];
    let lastIndex = 0;
    components.forEach((component) => {
      const md = body.substring(lastIndex, component.index);
      data.body.push(marked(md));
      data.body.push(parseComponent(component.subMatches[0]));
      lastIndex = component.index + component.match.length;
    });
  }

  return data;
};
