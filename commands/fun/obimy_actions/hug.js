const name = 'Hug'
const value = name.split(' ').join('_').toLowerCase()
const act = 'hugged'

module.exports = {
   name,
   value,
   img: 'https://media0.giphy.com/media/1JmGiBtqTuehfYxuy9/giphy.gif?cid=790b761185100cba7f9ec8cda8b55842dfe5cf34cc0ae3fa&rid=giphy.gif&ct=g',
   act,
   reply(userFrom, userTo) {
      return `${this.act} you.`;
   },
};
