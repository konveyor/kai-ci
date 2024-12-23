import os

import boto3
from dotenv import load_dotenv

from logger import get_logger

load_dotenv()
logger = get_logger(__name__)


def upload(file: str, path: str, content_type: str = "binary/octet-stream") -> str:
    bucket_name = os.getenv("S3_BUCKET_NAME")
    s3 = boto3.resource('s3')
    s3.Bucket(bucket_name).upload_file(file, Key=path, ContentType=content_type)
    logger.debug(f"Uploaded file {file} to {path}")
    return f'https://{bucket_name}.s3.us-east-1.amazonaws.com/{file}'


def download(file: str, path: str):
    s3 = boto3.client('s3')
    s3.download_file(os.getenv("S3_BUCKET_NAME"), file, path)


def delete(file: str):
    s3 = boto3.client('s3')
    s3.delete_object(Bucket=os.getenv("S3_BUCKET_NAME"), Key=file)
