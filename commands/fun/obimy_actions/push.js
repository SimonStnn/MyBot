const name = 'Push';
const value = name.split(' ').join('_').toLowerCase();
const act = 'pushed';

module.exports = {
   name,
   value,
   act,
   reply(userFrom, userTo) {
      return `${this.act} you.`;
   },
};
