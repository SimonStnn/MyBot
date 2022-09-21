const name = 'Lick';
const value = name.split(' ').join('_').toLowerCase();
const act = 'licked';

module.exports = {
   name,
   value,
   img: 'https://media3.giphy.com/media/11dPyMQxP2xFqo/giphy.gif?cid=790b7611ca54d514685dfecc7502f5a563ed3897b5f988ea&rid=giphy.gif&ct=g',
   act,
   reply(userFrom, userTo) {
      return `${this.act} you.`;
   },
};
