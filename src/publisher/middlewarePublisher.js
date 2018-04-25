const BasePublisher = require('./basePublisher');

const create =
  (channel, exchange) =>
    createWithMiddlewares(channel, exchange);

const createWithMiddlewares =
  (channel, exchange, middlewares = []) =>
    BasePublisher.create(channel, exchange)
      .then(basePublisher => ({
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
          reduceMiddlewares(middlewares, routingKey, content, options)
            .then(args => basePublisher.publish(...args)),
        /**
         * @param {...Function} middlewaresToUse
         */
        use: (...middlewaresToUse) =>
          Promise.all([...middlewares, ...middlewaresToUse])
            .then(middlewares => middlewares.map(resolveFullMiddleware))
            .then(middlewares => createWithMiddlewares(channel, exchange, middlewares))
      }));

const resolveFullMiddleware =
  ({ onRoutingKey = identity, onContent = identity, onOptions = identity }) =>
    ({
      onRoutingKey,
      onContent,
      onOptions,
    });

const reduceMiddlewares =
  (middlewares, routingKey, content, options) =>
    promiseReduce(
      middlewares,
      ([routingKey, content, options], { onRoutingKey, onContent, onOptions }) =>
        Promise.all([onRoutingKey(routingKey), onContent(content), onOptions(options)]),
      [routingKey, content, options]
    );

const promiseReduce =
  (items, fn, init) => items.reduce(
    (prevPromise, curr) => prevPromise.then(prev => fn(prev, curr)),
    Promise.resolve(init)
  );

const identity = x => x;

module.exports = {
  create,
};
