const name = 'Love pinch';
const value = name.split(' ').join('_').toLowerCase();
const act = 'love pinch';

module.exports = {
   name,
   value,
   img: 'https://c.tenor.com/CQh4TPgZ1_4AAAAC/love-pinch.gif',
   act,
   reply(userFrom, userTo) {
      return `send you a ${this.act}`;
   },
};
