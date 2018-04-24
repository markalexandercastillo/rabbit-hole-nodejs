
/**
 * Allows for the publishing of strings as content
*/
module.exports = {
  /**
   * @param {string} content
   * @return {Buffer}
   */
  onContent: content => Buffer.from(content),
};
