import os
import subprocess
from pathlib import Path

from consts import KAI_EVAL_FOLDER, COOLSTORE_FOLDER
from files import clone_repository
from kai_handler import get_python_venv_executable
from logger import get_logger
from utils import is_windows

logger = get_logger(__name__)


def download_kai_eval():
    clone_repository('kai-eval', 'https://github.com/abrugaro/kai-eval.git', 'main')
    os.rename('data/kai-eval/', KAI_EVAL_FOLDER)


def parse_kai_logs():
    python_venv_executable = get_python_venv_executable()
    result = subprocess.run(
        [
            Path(f"../../{python_venv_executable}"),
            "parse_kai_logs.py",
            "../kai/example/analysis/coolstore/output.yaml",  # input file
            f"../../{COOLSTORE_FOLDER}",  # repository path
            "../../data/kai-logs-parsed.yaml"  # output
        ],
        cwd="kai_files/kai-eval",
        capture_output=True,
        text=True,
        shell=is_windows()
    )

    if result.returncode == 0:
        logger.info(f"Script executed successfully:\n{result.stdout}")
    else:
        raise Exception(f"kai logs parsing failed with return code {result.returncode}: \n{result.stderr}")


def evaluate():
    python_venv_executable = get_python_venv_executable()
    evaluate_command_args = [
        Path(f"../../{python_venv_executable}"),
        "evaluate.py",
        "-c",
        "../../fixtures/config.toml",
        "../../data/kai-logs-parsed.yaml",  # input_file
        "../../data/kai-eval-result.yaml"  # output_file
    ]
    logger.debug(f"Runnin evaluation: {evaluate_command_args}")
    result = subprocess.run(
        evaluate_command_args,
        cwd=KAI_EVAL_FOLDER,
        capture_output=True,
        text=True,
        shell=is_windows()
    )

    if result.returncode == 0:
        logger.info(f"Script executed successfully:\n{result.stdout}")
    else:
        raise Exception(f"Evaluation failed with return code {result.returncode}: \n{result.stderr}")


def generate_report():
    python_venv_executable = get_python_venv_executable()
    result = subprocess.run(
        [
            Path(f"../../{python_venv_executable}"),
            "generate_report.py",
            "../../data/kai-eval-result.yaml",  # input
            "../../data/kai-report.json",  # output
            "json"  # format
        ],
        cwd="kai_files/kai-eval",
        capture_output=True,
        text=True,
        shell=is_windows()
    )

    if result.returncode == 0:
        logger.info(f"Script executed successfully:\n{result.stdout}")
    else:
        raise Exception(f"Report generation failed with return code {result.returncode}: \n{result.stderr}")
