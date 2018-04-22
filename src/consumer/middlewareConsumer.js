const BaseConsumer = require('./baseConsumer');

const create =
  (channel, queue) =>
    createWithMiddlewares(channel, queue);

const createWithMiddlewares =
  (channel, queue, options, middlewares = []) => {
    const baseConsumer = BaseConsumer.create(channel, queue, options);
    return {
      ...baseConsumer,
      /**
       * @callback cb
       */
      consume: (cb, options = {}) =>
        baseConsumer.consume(
          message => cb(
            middlewares.reduce(
              (message, middleware) => middleware(message),
              message
            )
          ),
          options
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
