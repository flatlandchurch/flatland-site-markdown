'use strict';
const { exec } = require('child_process');
const { promisify } = require('util');

module.exports = async (start) => {
  const { stdout } = await promisify(exec)('git rev-list HEAD');
  const list = (stdout || '').trim().split('\n').reverse();
  const startIdx = list.findIndex((c) => c === start);
  return list.slice(startIdx !== undefined ? startIdx + 1 : 0);
};
