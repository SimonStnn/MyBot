const name = 'Kiss';
const value = name.split(' ').join('_').toLowerCase();
const act = 'kissed';

module.exports = {
   name,
   value,
   img: 'https://i.pinimg.com/originals/ed/69/31/ed6931bba91425579d67b6be8991a67e.gif',
   act,
   reply(userFrom, userTo) {
      return `${this.act} you.`;
   },
};
