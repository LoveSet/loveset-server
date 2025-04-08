function generateRef(length) {
  // Create an array of uppercase letters and numbers
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";

  // Generate a 6-character code
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }

  return code;
}

module.exports = generateRef;
