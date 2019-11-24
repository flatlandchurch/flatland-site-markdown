'use strict';
const write = require('write-json-file');
const read = require('load-json-file');
const path = require('path');

const pkg = require('../package');
const revList = require('./utils/revList');
const getDiffs = require('./utils/getDiffs');
const parseMarkdown = require('./utils/parseMarkdown');
const parseAST = require('./utils/parseAST');

const save = require('./save');
const render = require('./render');

const [buildLocation, sha] = process.argv.slice(2);

(async () => {
  const META_TREE_PATH = path.join(__dirname, '../', '.meta_tree.json');
  const metaTree = await read(META_TREE_PATH);

  const commits = await revList(pkg.lastSha);
  // TODO: need a nuclear option for template changes
  // globby('/content/**') + action: 'modified' (should do it)
  const files = await getDiffs(commits);

  const contents = (await Promise.all(files
    .map(async (f) => {
      if (f.action === 'deleted') {
        delete metaTree[f.path];
      } else {
        const { meta, body } = await parseMarkdown(path.join(__dirname, '../', f.path));
        f.meta = meta;
        f.body = body;
        metaTree[f.path] = meta;
      }
      return f;
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

  await Promise.all((await Promise.all(contents
    .map(render(metaTree))))
    .map(save(buildLocation)));

  // render needed changes to indexes
  // - Series
  // - Sermons
  // - Events
  // - Blog
  // - Classes
})();
