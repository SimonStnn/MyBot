const name = 'Punch';
const value = name.split(' ').join('_').toLowerCase();
const act = 'punched';

module.exports = {
   name,
   value,
   act,
   reply(userFrom, userTo) {
      return `${this.act} you.`;
   },
};
