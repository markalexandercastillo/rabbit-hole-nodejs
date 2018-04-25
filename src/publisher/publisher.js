const create =
  connectionPool => ({
    BasePublisher: {
      create: createPublisher(connectionPool, require('./basePublisher'))
    },
    MiddlewarePublisher: {
      create: createPublisher(connectionPool, require('./middlewarePublisher'))
    },
  });

const createPublisher =
  /**
   * @param {object} connectionPool
   * @param {object} publisherModule
   */
  (connectionPool, publisherModule) =>
    /**
    * @param {string} exchange
    */
    exchange =>
      connectionPool.getForPublisher()
        .then(connection => connection.getChannel({ exchange }))
        .then(channel => publisherModule.create(channel, exchange));

module.exports = {
  create,
};
