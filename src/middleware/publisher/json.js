const CONTENT_TYPES = require('./../../contentTypes')
  , stringMiddleware = require('./string');

module.exports =
  /**
   *
   */
  (routingKey, content, options = {}) =>
    stringMiddleware(routingKey, JSON.stringify(content), {
      ...options,
      contentType: CONTENT_TYPES.JSON,
    });
