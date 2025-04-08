const generateLetter = () => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  return characters.charAt(Math.floor(Math.random() * characters.length));
};

module.exports = generateLetter;
