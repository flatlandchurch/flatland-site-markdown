'use strict';
const { exec } = require('child_process');
const { promisify } = require('util');
const multimatch = require('multimatch');

module.exports = async (commits) => {
  const committedFiles = await commits.reduce(async (acc, commit) => {
    const cmd = `git diff-tree --no-commit-id --name-only -r ${commit}`;
    const { stdout } = await promisify(exec)(cmd);
    const files = stdout.trim().split('\n');
    acc.push(...files);
    return acc;
  }, []);
  return multimatch(committedFiles, ['content/**']);
};
