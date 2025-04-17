import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

export async function uploadObject(
  file: string,
  path: string,
  contentType = 'application/json'
) {
  const client = new S3Client({ region: process.env.AWS_DEFAULT_REGION });
  return client.send(
    new PutObjectCommand({
      Key: path,
      Body: file,
      Bucket: process.env.S3_BUCKET_NAME,
      ContentType: contentType,
    })
  );
}

export async function downloadObject(path: string) {
  const client = new S3Client({ region: process.env.AWS_DEFAULT_REGION });
  return client.send(
    new GetObjectCommand({
      Key: path,
      Bucket: process.env.S3_BUCKET_NAME,
    })
  );
}
