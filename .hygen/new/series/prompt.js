module.exports = [
  {
    type: 'input',
    name: 'title',
    message: 'Title?',
  },
  {
    type: 'confirm',
    name: 'concluded',
    message: 'Concluded?',
    default: false,
  },
  {
    type: 'numeral',
    name: 'volumes',
    message: 'Volumes?',
  },
  {
    type: 'list',
    name: 'authors',
    message: 'Authors?',
  },
];
