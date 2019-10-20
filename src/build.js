'use strict';
const write = require('write-json-file');
const read = require('load-json-file');
const path = require('path');

const revList = require('./utils/revList');
const getDiffs = require('./utils/getDiffs');
const getDependencyTree = require('./utils/getDependencyTree');
const parseMarkdown = require('./utils/parseMarkdown');

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
      const content = await parseMarkdown(path.join(__dirname, '../content', f));

      if (typeof content !== 'object' && content === 'DELETED') return;

      metaTree[f] = content.meta;

      // TODO: add meta to committed JSON tree
      return ({
        meta: content.meta,
        body: content.body,
      });
    })))
    .filter((t) => t);

  await write(META_TREE_PATH, metaTree);

  // Body will change over time, meta should remain unchanged
  // Body should end as a string
  // Meta should be only what is needed to render/link pages
})();
