'use strict';
const { exec } = require('child_process');
const { promisify } = require('util');
const multimatch = require('multimatch');

module.exports = async (commits) => {
  const committedFiles = await Promise.all(commits.map(async (commit) => {
    const cmd = `git diff-tree --no-commit-id --name-only -r ${commit}`;
    const { stdout } = await promisify(exec)(cmd);
    return stdout.trim().split('\n');
  }));
  const flattenedList = committedFiles.reduce((acc, f) => {
    acc.push(...f);
    return acc;
  }, []);
  return multimatch(flattenedList, ['content/**']);
};
