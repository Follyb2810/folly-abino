const bcrypt = require('bcrypt')


 const HashPassword = async(password)=>{
 const hashPwd =await bcrypt.hash(password,10)
 return hashPwd
}
// const bcrypt = require('bcrypt');

const ComparePassword = async (password, hash) => {
  try {
    // Use bcrypt.compare to compare the plaintext password with the hashed password
    const match = await bcrypt.compare(password, hash);
    return match;
  } catch (error) {
    // Handle errors appropriately, log or throw
    console.error(error);
    throw new Error('Error comparing passwords');
  }
};


module.exports ={
    HashPassword,ComparePassword
}