const name = 'Bite';
const value = name.split(' ').join('_').toLowerCase();
const act = 'bit';

module.exports = {
   name,
   value,
   act,
   reply(userFrom, userTo) {
      return `${this.act} you.`;
   },
};
