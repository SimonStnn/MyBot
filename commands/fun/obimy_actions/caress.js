const name = 'Caress';
const value = name.split(' ').join('_').toLowerCase();
const act = 'caress';

module.exports = {
   name,
   value,
   act,
   reply(userFrom, userTo) {
      return `${this.act} about you.`;
   },
};
