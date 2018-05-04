const CONTENT_TYPES = require('./../../contentTypes')
  , stringMiddleware = require('./string');

const onContent = JSON => content => stringMiddleware.onContent(JSON.stringify(content));

const onOptions = (options = {}) => ({
  ...options,
  contentType: CONTENT_TYPES.JSON,
});

const defaultJson = {
  stringify: JSON.stringify,
};

module.exports = ({JSON = defaultJson} = {}) => ({
  onContent: onContent(JSON),
  onOptions,
});
