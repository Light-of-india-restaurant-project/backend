import bcrypt from 'bcryptjs';

const generateHash = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const compareHash = async (enteredPassword: string, dbSavedPassword: string): Promise<boolean> => {
  const isSame = await bcrypt.compare(enteredPassword, dbSavedPassword);
  return isSame;
};

export { generateHash, compareHash };
