const name = 'Tickle';
const value = name.split(' ').join('_').toLowerCase();
const act = 'tickled';

module.exports = {
   name,
   value,
   act,
   reply(userFrom, userTo) {
      return `${this.act} you.`;
   },
};
