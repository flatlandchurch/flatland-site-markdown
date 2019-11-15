const slug = require('slugify');

const components = require('../components');

const slugify = (text) => slug(text, {
  replacement: '-',
  remove: /[*+~.()'"!:@?]/g,
  lower: true,
});

const p = (text) => `<p>${text}</p>`;
const strong = (text) => `<strong>${text}</strong>`;
const em = (text) => `<em>${text}</em>`;
const a = (url, title) => (text) => title ? `<a href="${url}" title="${title}">${text}</a>` : `<a href="${url}">${text}</a>`;
const ul = (text) => `<ul>${text}</ul>`;
const ol = (text) => `<ol>${text}</ol>`;
const li = (text) => `<li>${text}</li>`;
const s = (text) => `<s>${text}</s>`;

function parseText(acc, child) {
  switch(child.type) {
    case 'text': {
      acc += child.value;
      return acc;
    }
    case 'strong': {
      acc += strong(child.children.reduce(parseText, ''));
      return acc;
    }
    case 'emphasis': {
      acc += em(child.children.reduce(parseText, ''));
      return acc;
    }
    case 'link': {
      acc += a(child.url, child.title)(child.children.reduce(parseText, ''));
      return acc;
    }
    case 'delete': {
      acc += s(child.children.reduce(parseText, ''));
      return acc;
    }
    default: return acc;
  }
}

module.exports = (metaTree) => async (acc, node) => {
  switch(node.type) {
    case 'ld+json': {
      acc += `<script type="application/ld+json">${JSON.stringify(node.value)}</script>`;
      return acc;
    }
    case 'heading': {
      const heading = (text) => `<h${node.depth} id="${slugify(text)}">${text}</h${node.depth}>`;
      const headingText = node.children.reduce((acc, child) => {
        if (child.type === 'text') {
          acc += child.value;
        }
        return acc;
      }, '');
      acc += heading(headingText);
      return acc;
    }
    case 'paragraph': {
      acc += p(node.children.reduce(parseText, ''));
      return acc;
    }
    case 'component': {
      if (!Object.hasOwnProperty.call(components, node.name)) {
        return acc;
      }

      const component = await components[node.name](metaTree, node.attributes);
      if (component) {
        acc += component;
      }
      return acc;
    }
    case 'list': {
      const listWrapper = node.ordered ? ol : ul;
      acc += listWrapper(node.children.reduce((acc, child) => {
        acc += li(child.children[0].children.reduce(parseText, ''));
        return acc;
      }, ''));
      return acc;
    }
    default:
      console.log(node);
  }
  return acc;
};
