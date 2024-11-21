import logging
import os
import platform
import subprocess

import requests

from files import unzip_file, download_file, rename_extracted_folder, set_executable_permissions
from logger import get_logger

logger = get_logger(__name__)

def download_kai_files():
    api_response = requests.get("https://api.github.com/repos/konveyor/kai/releases/latest")
    if api_response.status_code != 200:
        logger.error(f"Failed to fetch the latest release API. Status code: {api_response.status_code}")
        return

    release_data = api_response.json()
    assets = release_data.get("assets", [])
    if not assets:
        logger.error("No assets found in the latest release")
        return

    system = platform.system().lower()

    if system == "windows":
        rpc_server_name = "kai-rpc-server.windows-x86_64.zip"
    elif system == "linux":
        rpc_server_name = "kai-rpc-server.linux-x86_64.zip"
    else:
        logger.error("Unsupported operating system")
        return

    rpc_server_url = next((asset["browser_download_url"] for asset in assets if asset["name"] == rpc_server_name), None)

    if not rpc_server_url:
        logger.error("Required asset not found")
        return

    source_code_url = release_data.get("zipball_url", "")
    file_path = os.path.join("kai_files", "source_code.zip")
    logger.info(f"Downloading Source code from {source_code_url}")
    download_file(source_code_url, file_path)
    unzip_file(file_path, "kai_files")
    rename_extracted_folder("kai_files", "kai")

    logger.info(f"Downloading RPC server binary from {rpc_server_url}")

    file_path = os.path.join("kai_files", rpc_server_name)
    download_file(rpc_server_url, file_path)
    unzip_file(file_path, os.path.join("kai_files", "kai", "example", "analysis"))

    if system == "linux":
        set_executable_permissions(os.path.join("kai_files", "kai", "example", "analysis", "kai-rpc-server"))
        set_executable_permissions(os.path.join("kai_files", "kai", "example", "analysis", "kai-analyzer-rpc"))


def setup_and_run_demo():
    kai_folder = "./kai_files/kai"
    venv_folder = os.path.join(kai_folder, "venv")

    system = platform.system().lower()
    if system == "windows":
        pip_executable = os.path.join(venv_folder, "Scripts", "pip")
        python_venv_executable = os.path.join(venv_folder, "Scripts", "python")
    else:
        pip_executable = os.path.join(venv_folder, "bin", "pip")
        python_venv_executable = os.path.join(venv_folder, "bin", "python")

    logger.debug("Creating virtual environment for running demo")
    subprocess.run(["python", "-m", "venv", venv_folder], check=True)

    logger.debug("Installing requirements")
    subprocess.run([pip_executable, "install", "pyinstaller"], check=True)
    subprocess.run([pip_executable, "install", "-e", kai_folder], check=True)
    subprocess.run([pip_executable, "install", "-r", os.path.join(kai_folder, "requirements.txt")], check=True)

    logger.info("Executing run_demo.py")
    result = subprocess.run(
        [os.path.join("../../../", python_venv_executable), "run_demo.py"],
        cwd=os.path.join(kai_folder, "example"),
        capture_output=True,
        text=True
    )

    if result.returncode == 0:
        logger.info(f"Script executed successfully:\n{result.stdout}")
    else:
        logger.error(f"Script failed with return code {result.returncode}: \n{result.stderr}")
