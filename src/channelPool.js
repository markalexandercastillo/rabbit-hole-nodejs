const create =
  connection =>
    createWithCache(connection);

const createWithCache =
  (connection, cache = {}) =>
    ({
      /**
       * Resolves to a newly created channel or a previously created one with the same options
       * @param {object} options
       * @param {number} options.prefetch
       * @param {string} options.queue
       * @param {string} options.exchange
       */
      get: (options = {}) =>
        Promise.resolve(cache[buildKey(options)])
          .then(channel => channel || createChannel(connection, options))
          .then(channel => ({
            [buildKey(options)]: channel,
            ...cache,
          }))
          .then(updatedcache => cache = updatedcache)
          .then(cache => cache[buildKey(options)]),
      /**
       * Closes all tracked channels
       */
      close: () =>
        Promise.all(Object.keys(cache).map(key => cache[key].close()))
    });

const createChannel =
  (connection, {prefetch = null}) =>
    connection.createChannel()
      .then(
        channel =>
          prefetch
            ? channel.prefetch(prefetch).then(() => channel)
            : channel
      );

const buildKey =
  ({queue = null, exchange = null, prefetch = null}) =>
    JSON.stringify({exchange, queue, prefetch});

module.exports = {
  create,
};
