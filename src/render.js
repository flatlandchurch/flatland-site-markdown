const ejs = require('ejs');

const parseAST = require('./utils/parseAST');
const getTemplate = require('./utils/getTemplate');

async function asyncReducer(arr, cb, initialValue) {
  if (!arr.length) {
    return initialValue;
  } else {
    const [first, ...rest] = arr;
    const acc = await cb(initialValue, first);
    return asyncReducer(rest, cb, acc);
  }
}

module.exports = (metaTree) => async (content) => {
  if (content.action === 'deleted') return content;

  const body = await asyncReducer(content.body.children, parseAST(metaTree), '');
  const wrappedBody = ejs.render(await getTemplate(content.type), {
    body,
    externalMeta: metaTree,
    meta: content.meta,
  });

  content.rendered = ejs.render(await getTemplate('root'), {
    body: wrappedBody,
    helmet: {
      title: 'getTitle() | Flatland Church'
    },
  });

  return content;
};
