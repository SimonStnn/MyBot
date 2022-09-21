const name = 'French kiss';
const value = name.split(' ').join('_').toLowerCase();
const act = 'french kissed';

module.exports = {
   name,
   value,
   act,
   reply(userFrom, userTo) {
      return `${this.act} you.`;
   },
};
