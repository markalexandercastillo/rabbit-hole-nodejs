const Connection = require('./connection');

const KEYS = {
  PUBLISHER: 'PUBLISHER',
  CONSUMER: 'CONSUMER',
};

const create =
  options =>
    createWithCache(options);

const createWithCache =
  (options, cache = {}) =>
    Promise.resolve({
      close: () =>
        Promise.all(Object.values(cache).map(connection => connection.close())),
      get: key =>
        Promise.resolve(cache[key])
          .then(connection => connection || Connection.create(options))
          .then(connection => ({
            [key]: connection,
            ...cache,
          }))
          .then(updatedCache => cache = updatedCache)
          .then(cache => cache[key])
    }).then(connectionPool => ({
      close: connectionPool.close,
      getForConsumer: () => connectionPool.get(KEYS.CONSUMER),
      getForPublisher: () => connectionPool.get(KEYS.PUBLISHER),
    }));

module.exports = {
  create,
};
