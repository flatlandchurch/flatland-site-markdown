'use strict';
const { exec } = require('child_process');
const { promisify } = require('util');
const minimatch = require('minimatch');

const getAction = (s) => {
  if (s === 'D') return 'deleted';
  if (s === 'A') return 'added';
  return 'modified';
};

// TODO: specify a list of valid types
const getType = (path) => {
  if (!path) return null;
  const [, type] = path.split('/');
  if (type.includes('.md')) return null;
  return type;
};

module.exports = async (commits) => {
  const committedFiles = await Promise.all(commits.map(async (commit) => {
    const cmd = `git diff-tree --no-commit-id -r ${commit}`;
    const { stdout } = await promisify(exec)(cmd);

    return stdout.trim()
      .split('\n')
      .filter((t) => t)
      .map((line) => {
        const columns = line.split(/\s/g);
        const [ file ] = columns.slice(-1);
        const path = minimatch(file, 'content/**') ? file : null;
        return {
          action: getAction(columns[4]),
          path,
          type: getType(path),
        };
      })
      .filter((t) => t.path && t.type);
  }));

  const changes = new Map();

  const flattendList = committedFiles.reduce((acc, arr) => {
    if (arr.length) {
      acc.push(...arr);
    }
    return acc;
  }, []).reverse();

  for (const item of flattendList) {
    if (!changes.has(item.path)) {
      changes.set(item.path, item);
    }
  }

  return ([...changes.keys()]).map((k) => changes.get(k));
};
