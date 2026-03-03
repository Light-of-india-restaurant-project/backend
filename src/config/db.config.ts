import mongoose from 'mongoose';

import log from '../utils/logger';

const dbPrefix = 'my-app-development'; // Restaurant database

const getDbName = (environment: string | undefined) => {
  // For production, use the database name from connection string
  if (environment === 'production') {
    return dbPrefix;
  }
  // For development/staging, also use the same database
  return dbPrefix;
};

const connectToDb = async ({ dbUri, environment }: { dbUri: string; environment: string }): Promise<void> => {
  try {
    const dbName = getDbName(environment);
    await mongoose.connect(dbUri, {
      dbName,
    });

    log.info('>>> Database Connected Successfully.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    await new Promise<void>((resolve) => {
      log.error(error, resolve);
    });
    throw error;
  }

  // logging messages for different status
  mongoose.connection.on('connected', () => {
    log.info('mongoose connected to db.');
  });

  mongoose.connection.on('error', (err) => {
    log.info(err.message);
  });

  mongoose.connection.on('disconnected', () => {
    log.info('mongoose connection is disconnected.');
  });

  // when sigint signal detect close the mongoose databse connection and exit
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      process.exit(0);
    } catch (error) {
      log.error(error);
      process.exit(1);
    }
  });
};

export default connectToDb;
