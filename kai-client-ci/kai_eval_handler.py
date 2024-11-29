import os
import subprocess

from consts import KAI_EVAL_FOLDER
from files import clone_repository
from kai_handler import get_python_venv_executable
from logger import get_logger

logger = get_logger(__name__)


# TODO (abrugaro) move to a class
# For discussing: As kai-eval is right now formed by 4 files that I already had to modify and they will need more changes in the near future
# We may directly integrate it in this repository

def download_kai_eval():
    clone_repository('kai-eval', 'https://github.com/abrugaro/kai-eval.git', 'main')
    os.rename('data/kai-eval/', KAI_EVAL_FOLDER)


def parse_kai_logs():
    python_venv_executable = get_python_venv_executable()
    result = subprocess.run(
        [
            os.path.join("../../", python_venv_executable),
            "parse_kai_logs.py",
            "../../fixtures/logs",  # input_dir TODO (abrugaro): replace with kai logs once run_demo works
            "../../data/kai-logs-parsed.yaml"  # output
        ],
        cwd="kai_files/kai-eval",
        capture_output=True,
        text=True
    )

    if result.returncode == 0:
        logger.info(f"Script executed successfully:\n{result.stdout}")
    else:
        raise Exception(f"kai logs parsing failed with return code {result.returncode}: \n{result.stderr}")


def evaluate():
    python_venv_executable = get_python_venv_executable()
    evaluate_command_args = [
        os.path.join("../../", python_venv_executable),
        "evaluate.py",
        "-c",
        "../../fixtures/config.toml",
        "../../data/kai-logs-parsed.yaml",  # input_dir
        "../../data/kai-eval-result.yaml"  # output
    ]
    logger.debug(f"Runnin evaluation: {' '.join(evaluate_command_args)}")
    result = subprocess.run(
        evaluate_command_args,
        cwd=KAI_EVAL_FOLDER,
        capture_output=True,
        text=True
    )

    if result.returncode == 0:
        logger.info(f"Script executed successfully:\n{result.stdout}")
    else:
        raise Exception(f"Evaluation failed with return code {result.returncode}: \n{result.stderr}")


def generate_report():
    python_venv_executable = get_python_venv_executable()
    result = subprocess.run(
        [
            os.path.join("../../", python_venv_executable),
            "generate_report.py",
            "../../data/kai-eval-result.yaml",  # input
            "../../data/kai-report.json",  # output
            "json"  # format
        ],
        cwd="kai_files/kai-eval",
        capture_output=True,
        text=True
    )

    if result.returncode == 0:
        logger.info(f"Script executed successfully:\n{result.stdout}")
    else:
        raise Exception(f"Report generation failed with return code {result.returncode}: \n{result.stderr}")
