'use strict';
const ejs = require('ejs');

const _import = require('../../utils/import');

const getTreeName = (name) => `content/${name}`;

const Link = async (metaTree, props) => {
  const template = await _import('./Link.ejs');
  const key = getTreeName(props.src);

  if (!metaTree.hasOwnProperty(key)) return null;

  return ejs.render(template, {
    link: metaTree[key],
    excerpt: props.excerpt || metaTree[key].excerpt,
  });
};

module.exports = Link;
