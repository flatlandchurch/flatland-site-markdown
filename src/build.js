'use strict';
const revList = require('./utils/revList');
const getDiffs = require('./utils/getDiffs');
const getDependencyTree = require('./utils/getDependencyTree');
const parseMarkdown = require('./utils/parseMarkdown');

const [buildLocation, sha] = process.argv.slice(2);

// NOTE: In nearly all cases, file system operations are run
// relative to process.cwd()

(async () => {
  // TODO: Change this to be a file with just last_sha
  const { _last_sha } = await getDependencyTree();

  const commits = await revList(_last_sha);
  const files = await getDiffs(commits);

  const contents = await Promise.all(files
    .map(async (f) => {
      const { meta, body } = await parseMarkdown(f);

      console.log(body);

      // TODO: add meta to committed JSON tree
      return ({ meta, body });
    }));
})();
