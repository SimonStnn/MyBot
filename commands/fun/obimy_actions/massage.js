const name = 'Massage';
const value = name.split(' ').join('_').toLowerCase();
const act = 'massaged';

module.exports = {
   name,
   value,
   act,
   reply(userFrom, userTo) {
      return `${this.act} you.`;
   },
};
