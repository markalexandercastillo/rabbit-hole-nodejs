const BasePublisher = require('./basePublisher');

const create =
  (channel, exchange, middlewares = []) => {
    const basePublisher = BasePublisher.create(channel, exchange);
    return {
      ...basePublisher,
      /**
       * @param {string} routingKey
       * @param {any} content This can be anything depending on any middlewares that may be set
       * @param {Object} options
       * @param {string} options.expiration
       * @param {string} options.userId
       * @param {string|string[]} options.CC
       * @param {number} options.priority
       * @param {boolean} options.persistent
       * @param {boolean|number} options.deliveryMode
       * @param {boolean} options.mandatory
       * @param {string|string[]} options.BCC
       * @param {boolean} options.immediate
       * @param {string} options.contentType
       * @param {string} options.contentEncoding
       * @param {object} options.headers
       * @param {string} options.correlationId
       * @param {string} options.replyTo
       * @param {string} options.messageId
       * @param {number} options.timestamp
       * @param {string} options.type
       * @param {string} options.appId
       */
      publish: (routingKey, content, options = {}) =>
        basePublisher.publish(...middlewares.reduce(
          (args, middleware) => middleware(...args),
          [routingKey, content, options])
        ),
      /**
       * @param {...Function} middlewaresToUse
       */
      use: (...middlewaresToUse) =>
        middlewares = [...middlewares, ...middlewaresToUse],
    };
  };

module.exports = {
  create,
};
