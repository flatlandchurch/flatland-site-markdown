const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

module.exports = async (template) => {
  const file = await promisify(fs.readFile)(path.join(__dirname, '../templates', `${template}.ejs`));
  return file.toString('utf-8');
};
