const name = 'Touch';
const value = name.split(' ').join('_').toLowerCase();
const act = 'touched';

module.exports = {
   name,
   value,
   act,
   reply(userFrom, userTo) {
      return `${this.act} you.`;
   },
};
