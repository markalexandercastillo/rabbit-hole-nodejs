const BaseConsumer = require('./baseConsumer');

const create =
  (channel, queue) =>
    createWithMiddlewares(channel, queue);

const createWithMiddlewares =
  (channel, queue, options, middlewares = []) =>
    BaseConsumer.create(channel, queue, options)
      .then(baseConsumer => ({
        ...baseConsumer,
        /**
         * @callback cb
         */
        consume: (cb, options = {}) =>
          baseConsumer.consume(
            ({ message }) =>
              reduceMiddlewares(middlewares, baseConsumer, message)
                .then(args => {
                  const {onErrorCalled, ...restOfArgs} = args;
                  if (!onErrorCalled) {
                    cb(restOfArgs);
                  }
                }),
            options
          ),
        /**
         * @param {...Function} middlewaresToUse
         */
        use: async (...middlewaresToUse) =>
          createWithMiddlewares(
            channel,
            queue,
            options,
            [
              ...middlewares,
              ...await Promise.all(middlewaresToUse)
            ]
          ),
      }));

const buildInitialArgs =
  (consumer, message) =>
    ({
      message,
      error: null,
      onErrorCalled: false,
      ack: consumer.ack,
      nack: consumer.nack,
    });

const reduceMiddlewares =
  (middlewares, consumer, message) =>
    promiseReduce(
      middlewares,
      (args, middleware) => resolveMiddleware(middleware, args),
      buildInitialArgs(consumer, message)
    );

const promiseReduce =
  (items, fn, init) => items.reduce(
    (prev, curr) => prev.then((prev => fn(prev, curr))),
    Promise.resolve(init)
  );

const resolveMiddleware =
  (middleware, args) =>
    args.error
      ? Promise.resolve(args)
      : resolveOnMessage(middleware, args)
        .then(args => args.error ? resolveOnError(middleware, args) : args);

const resolveOnMessage =
  (middleware, args) =>
    (new Promise((resolve, reject) => {
      try {
        resolve(middleware.onMessage(args.message));
      } catch (e) {
        reject(e);
      }
    }))
      .then(message => ({ ...args, message }))
      .catch(error => ({ ...args, error }));

const resolveOnError =
  (middleware, args) =>
    middleware.onError
      ? Promise.resolve(middleware.onError(args))
        .then(() => ({ ...args, onErrorCalled: true }))
      : Promise.resolve(args);

module.exports = {
  create,
};
