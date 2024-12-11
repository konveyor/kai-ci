import platform
import shutil
import stat
import zipfile
import os
import git

import requests
from git import Repo

from logger import get_logger

logger = get_logger(__name__)


def download_file(url: str, file_path: str):
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(file_path, 'wb') as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        logger.info(f'Downloaded {file_path}')
    else:
        logger.error(f'Failed to download the file {file_path} | Status code: {response.status_code}')


def rename_extracted_folder(base_folder: str, target_folder_name: str):
    """
        Renames the extracted source code folder which is in format konveyor-kai-[uid] to a standard name 'kai'
    """
    extracted_folders = [
        folder for folder in os.listdir(base_folder)
        if os.path.isdir(os.path.join(base_folder, folder)) and folder.startswith('konveyor-kai-')
    ]

    original_folder_path = os.path.join(base_folder, extracted_folders[0])
    target_folder_path = os.path.join(base_folder, target_folder_name)

    try:
        shutil.move(original_folder_path, target_folder_path)
    except Exception as e:
        logger.error(f'Failed to rename folder: {e}')


def clone_repository(app_name: str, repository_url: str, branch: str):
    clone_dir = os.path.join('data', f'{app_name}')
    git.Repo.clone_from(repository_url, clone_dir, branch=branch)
    logger.info(f"Repository {app_name} {branch} cloned into 'data'")

def count_modified_files(repo_path: str) -> int:
    repo = Repo(repo_path)
    diff = repo.git.diff('--numstat')
    modified_files = len(diff.splitlines())
    return modified_files

def unzip_file(zip_path: str, extract_folder: str):
    extract_folder = winapi_path(extract_folder)
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_folder)
        logger.info(f'Extracted {zip_path} into {extract_folder}')
    except zipfile.BadZipFile:
        logger.error(f'Failed to extract {zip_path}')


def zip_folder(input_dir: str, file_name: str, output_dir: str) -> str:
    zip_filename = f'{file_name}.zip'
    zip_path = os.path.join(output_dir, zip_filename)

    shutil.make_archive(zip_path.replace('.zip', ''), 'zip', input_dir)
    logger.info(f'Repository compressed into {zip_path}')
    return zip_path


def copy_file(src: str, dst: str):
    try:
        if os.path.isdir(src):
            shutil.copytree(src, dst)
        else:
            shutil.copy(src, dst)
        logger.info(f'Copied {src} to {dst}')
    except Exception as e:
        logger.error(f'Error while copying {src} to {dst}: {e}')


def set_executable_permissions(file_path: str):
    try:
        logger.info(f'Setting executable permissions for {file_path}')
        st = os.stat(file_path)
        os.chmod(file_path, st.st_mode | stat.S_IEXEC)
        logger.info(f'Executable permissions set for {file_path}')
    except FileNotFoundError:
        logger.error(f'File not found: {file_path}')
    except Exception as e:
        logger.error(f'Failed to set executable permissions for {file_path}: {e}')


def on_rmtree_error(func, path, exc_info):
    """"
    Error handler for ``shutil.rmtree``.
    This happens mostly on windows
    If the error is due to an access error (read only file)
    it attempts to add write permission and then retries.

    If the error is for another reason it re-raises the error.

    Usage : ``shutil.rmtree(path, onerror=onerror)``
    """
    import stat
    if not os.access(path, os.W_OK):
        os.chmod(path, stat.S_IWUSR)
        func(path)
    else:
        raise

def winapi_path(dos_path, encoding=None):
    """
    Fix to avoid path too long errors while extracting kai in Windows
    """
    if platform.system().lower() != "windows":
        return dos_path

    path = os.path.abspath(dos_path)

    if path.startswith("\\\\"):
        path = "\\\\?\\UNC\\" + path[2:]
    else:
        path = "\\\\?\\" + path

    return path