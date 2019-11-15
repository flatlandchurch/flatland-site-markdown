'use strict';
const ejs = require('ejs');
const cx = require('classnames');

const _import = require('../../utils/import');

const getTreeName = (name) => `content/${name}`;

const Link = async (metaTree, props) => {
  const template = await _import('./Link.ejs');
  const key = getTreeName(props.src);

  if (!metaTree.hasOwnProperty(key)) return null;

  const url = `/${props.src.replace(/\.md/, '')}`;

  const buttonClass = cx('fc-button', {
    [`fc-button--${props.color}`]: !!props.color,
  });

  return ejs.render(template, {
    link: metaTree[key],
    url,
    buttonClass,
    excerpt: props.excerpt || metaTree[key].excerpt,
  });
};

module.exports = Link;
