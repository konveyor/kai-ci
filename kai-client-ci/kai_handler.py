import os
import platform
import shutil
import subprocess
from pathlib import Path

import requests

from consts import KAI_FILES_FOLDER, KAI_FOLDER
from files import unzip_file, download_file, rename_extracted_folder, set_executable_permissions, copy_file, \
    clone_repository, on_rmtree_error, remove_dependency_from_requirements
from logger import get_logger
from utils import is_windows

logger = get_logger(__name__)


def download_kai_release():
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
        rpc_server_name = "kai-rpc-server.windows-X64.zip"
    elif system == "linux":
        rpc_server_name = "kai-rpc-server.linux-x86_64.zip"
    else:
        logger.error("Unsupported operating system")
        return

    rpc_server_url = next((asset["browser_download_url"] for asset in assets if asset["name"] == rpc_server_name), None)

    if not rpc_server_url:
        logger.error(f"Error while finding url for {rpc_server_name}")
        raise Exception(f"Error while finding url for {rpc_server_name}")

    source_code_url = release_data.get("zipball_url", "")
    file_path = os.path.join(KAI_FILES_FOLDER, "source_code.zip")
    logger.info(f"Downloading Kai Source code from {source_code_url}")
    download_file(source_code_url, file_path)
    unzip_file(file_path, KAI_FILES_FOLDER)
    rename_extracted_folder(KAI_FILES_FOLDER, "kai")
    remove_dependency_from_requirements(Path(f"{KAI_FOLDER}/requirements.txt"), "imgui")

    logger.info(f"Downloading RPC server binary from {rpc_server_url}")

    file_path = os.path.join(KAI_FILES_FOLDER, rpc_server_name)
    download_file(rpc_server_url, file_path)
    unzip_file(file_path, os.path.join(KAI_FILES_FOLDER, "kai", "example", "analysis"))

    if system == "linux":
        set_executable_permissions(os.path.join(KAI_FILES_FOLDER, "kai", "example", "analysis", "kai-rpc-server"))
        set_executable_permissions(os.path.join(KAI_FILES_FOLDER, "kai", "example", "analysis", "kai-analyzer-rpc"))

def setup_kai_external_files():
    # TODO (@abrugaro) These files are currently extracted from a Docker container so they are placed here as fixtures to allow the script to run in Windows.
    # Once these files are provided as part of a release of https://github.com/konveyor/java-analyzer-bundle they can be fetched as well
    files_to_move = ['jdtls', 'bundle.jar', 'maven.default.index']

    for file_name in files_to_move:
        source_path = os.path.join('./fixtures', file_name)
        target_path = os.path.join('./kai_files/kai/example/analysis', file_name)
        copy_file(source_path, target_path)

    copy_file('./fixtures/config.toml', './kai_files/kai/example/')

    clone_repository('rulesets', 'https://github.com/konveyor/rulesets.git', 'main')
    os.rename('data/rulesets/default/generated/', 'kai_files/kai/example/analysis/rulesets')
    shutil.rmtree('data/rulesets/', onerror=on_rmtree_error)

    clone_repository('coolstore', 'https://github.com/konveyor-ecosystem/coolstore', 'main')
    os.rename('data/coolstore', 'kai_files/kai/example/coolstore')


def setup_kai_dependencies():
    venv_folder = os.path.join(KAI_FOLDER, "venv")

    if is_windows():
        pip_executable = os.path.join(venv_folder, "Scripts", "pip")
    else:
        pip_executable = os.path.join(venv_folder, "bin", "pip")

    logger.debug("Creating virtual environment for running demo")
    subprocess.run(["python", "-m", "venv", venv_folder], check=True)

    logger.debug("Installing requirements")
    subprocess.run([pip_executable, "install", "pyinstaller"], check=True)
    subprocess.run([pip_executable, "install", "-e", KAI_FOLDER], check=True)
    subprocess.run([pip_executable, "install", "-r", os.path.join(KAI_FOLDER, "requirements.txt")], check=True)


def run_demo():
    python_venv_executable = get_python_venv_executable()
    demo_rel_path = Path(f"../../../{python_venv_executable}")
    cwd = os.path.join(KAI_FOLDER, "example")

    logger.info("Executing run_demo.py")
    logger.debug(f"Running {demo_rel_path} run_demo.py from {cwd}")
    result = subprocess.run(
        [demo_rel_path, "run_demo.py"],
        cwd=cwd,
        capture_output=True,
        text=True,
        shell=is_windows()
    )

    if result.returncode == 0:
        logger.info(f"run_demo.py script executed successfully:\n{result.stdout}")
    else:
        logger.error(f"run_demo.py failed with return code {result.returncode}: \n{result.stderr}")

def get_python_venv_executable() -> str:
    """
        :return: python venv executable path which is kai_files/kai
    """
    venv_folder = os.path.join(KAI_FOLDER, "venv")

    if is_windows():
        return os.path.join(venv_folder, "Scripts", "python")

    return os.path.join(venv_folder, "bin", "python")

def setup() -> None:
    download_kai_release()
    setup_kai_external_files()
    setup_kai_dependencies()