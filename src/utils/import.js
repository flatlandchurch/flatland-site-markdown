const path = require('path');
const fs = require('graceful-fs');
const { promisify } = require('util');

module.exports = (fp) => promisify(fs.readFile)(path.join(__dirname, fp), 'utf-8');
