import os

import boto3
from dotenv import load_dotenv

from logger import get_logger
load_dotenv()
logger = get_logger(__name__)


def upload(file):
    bucket_name = os.getenv("S3_BUCKET_NAME")
    s3 = boto3.resource('s3')
    s3.Bucket(bucket_name).upload_file(file, Key=file)
    return f'https://{bucket_name}.s3.us-east-1.amazonaws.com/{file}'
