import mongoose from 'mongoose';

export const startSessionWithTransaction = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();
  return session;
};

export const convertMongooseIdToString = (id: mongoose.Types.ObjectId | string): string => {
  return typeof id === 'string' ? id : id.toString();
};
