const e = require('./error.js')

module.exports = {
   name: 'connectionError',
   async execute(client, queue, error) {
      await e.execute(client, queue, error)
   },
};
