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
                (message, { onMessage, onError = null }) =>
                  !message.hadMiddlewareError
                    ? Promise.resolve(onMessage(message))
                      .catch(error =>
                        onError
                          ? Promise.resolve(onError({
                            error,
                            message,
                            nack: baseConsumer.nack,
                            ack: baseConsumer.ack,
                          }))
                          : Promise.reject(error)
                      )
                      .then(() => ({
                        ...message,
                        hadMiddlewareError: true,
                      }))
                    : message,
                {...message, hadMiddlewareError: false}
              ).then(message => {
                if (!message.hadMiddlewareError) {
                  cb({message});
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
