const name = 'Slap';
const value = name.split(' ').join('_').toLowerCase();
const act = 'slapped';

module.exports = {
   name,
   value,
   act,
   reply(userFrom, userTo) {
      return `${this.act} you.`;
   },
};
