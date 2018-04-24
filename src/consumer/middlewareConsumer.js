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
              // go through middlewares
              promiseReduce(
                middlewares,
                (args, { onMessage, onError = null }) =>
                  // check if an error had occurred in a previous iteration
                  !args.error
                    // call the middleware onMessage on the message argument
                    ? Promise.resolve(onMessage(args.message))
                      // merge transformed message from onMessage consume callback args
                      .then(message => ({...args, message}))
                      // the onMessage callback rejected
                      .catch(error =>
                        // check if the middleware has an onError
                        onError
                          // invoke onError with consume callback args (for consistency)
                          ? Promise.resolve(onError({...args, error}))
                            // merge error into consume callback args so that the error check above does its job
                            .then(() => ({...args, error}))
                          // reject when there no onError is set
                          : Promise.reject(error)
                      )
                    // do nothing, just keep passing the consume callback arguments until the iterating has completed
                    : args,
                // initialize consume callback arguments
                {message, error: null, ack: baseConsumer.ack, nack: baseConsumer.nack}
              ).then(args => {
                // check if an error has been set from the middleware processing
                if (!args.error) {
                  // pass consume callback args into the final consume callback
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
