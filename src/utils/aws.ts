import { S3Client } from '@aws-sdk/client-s3';
import { SES } from '@aws-sdk/client-ses';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import 'dotenv/config';

export const awsS3Client = new S3Client({ region: process.env.AWS_REGION, credentials: defaultProvider() });

export const awsSES = new SES({
  apiVersion: '2010-12-01',
  region: 'us-east-1',
  credentials: defaultProvider(),
});
