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
            ({message}) =>
              promiseReduce(
                middlewares,
                (args, { onMessage, onError = null }) =>
                  !args.error
                    ? Promise.resolve(onMessage(args.message))
                      .then(() => (args))
                      .catch(error =>
                        onError
                          ? Promise.resolve(onError({
                            ...args,
                            error,
                          })).then(() => ({
                            ...args,
                            error,
                          }))
                          : Promise.reject(error)
                      )
                    : args,
                {message, error: null, ack: baseConsumer.ack, nack: baseConsumer.nack}
              ).then(args => {
                if (!args.error) {
                  cb(args);
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

const promiseReduce =
  (items, fn, init) => items.reduce(
    (prev, curr) => prev.then(prev => fn(prev, curr)),
    Promise.resolve(init)
  );

module.exports = {
  create,
};
