const CONTENT_TYPES = require('./../../contentTypes')
  , stringMiddleware = require('./string');

const onContent = content => stringMiddleware.onContent(JSON.stringify(content));

const onOptions = (options = {}) => ({
  ...options,
  contentType: CONTENT_TYPES.JSON,
});

module.exports = {
  onContent,
  onOptions,
};
