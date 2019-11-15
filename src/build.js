'use strict';
const write = require('write-json-file');
const read = require('load-json-file');
const path = require('path');

const revList = require('./utils/revList');
const getDiffs = require('./utils/getDiffs');
const getDependencyTree = require('./utils/getDependencyTree');
const parseMarkdown = require('./utils/parseMarkdown');
const saveFiles = require('./utils/saveFiles');
const parseAST = require('./utils/parseAST');

const [buildLocation, sha] = process.argv.slice(2);

(async () => {
  const META_TREE_PATH = path.join(__dirname, '../', '.meta_tree.json');
  // TODO: Change this to be a file with just last_sha
  const { _last_sha } = await getDependencyTree();
  const metaTree = await read(META_TREE_PATH);

  const commits = await revList(_last_sha);
  const files = await getDiffs(commits);

  const contents = (await Promise.all(files
    .map(async (f) => {
      const content = await parseMarkdown(path.join(__dirname, '../', f));

      if (typeof content !== 'object' && content === 'DELETED') return;

      metaTree[f] = content.meta;

      return content;
    })));

  await write(META_TREE_PATH, metaTree);

  async function asyncReducer(arr, cb, initialValue) {
    if (!arr.length) {
      return initialValue;
    } else {
      const [first, ...rest] = arr;
      const acc = await cb(initialValue, first);
      return asyncReducer(rest, cb, acc);
    }
  }

  const renderedContents = await Promise.all(contents.map(c => asyncReducer(c.body.children, parseAST(metaTree), '')));

  // All work to actual files should be done by this point
  await saveFiles(buildLocation, renderedContents, files);

  // render needed changes to indexes
  // - Series
  // - Sermons
  // - Events
  // - Blog
  // - Classes
})();
