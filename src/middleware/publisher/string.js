module.exports =
  /**
   * Allows for the publishing of strings as content
   * @param {string} routingKey
   * @param {string} content
   * @param {object} options
   */
  (routingKey, content, options = {}) => [
    routingKey,
    Buffer.from(content),
    options,
  ];
