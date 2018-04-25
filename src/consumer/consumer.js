const create =
  connectionPool => ({
    BaseConsumer: {
      create: createConsumer(connectionPool, require('./baseConsumer')),
    },
    MiddlewareConsumer: {
      create: createConsumer(connectionPool, require('./middlewareConsumer')),
    },
  });

const createConsumer =
  /**
   * @param {object} connectionPool
   * @param {object} consumerModule
   */
  (connectionPool, consumerModule) =>
    /**
     * @param {string} queue
     * @param {object} [options={}]
     * @param {number} [options.prefetch=1]
     */
    (queue, { prefetch = 1 } = {}) =>
      connectionPool.getForConsumer()
        .then(connection => connection.getChannel({ queue, prefetch }))
        .then(channel => consumerModule.create(channel, queue, { prefetch }));

module.exports = {
  create,
};
