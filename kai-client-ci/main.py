import json
import shutil
import time
import os
from datetime import datetime

import kai_eval_handler
import kai_handler
from consts import KAI_FOLDER, KAI_FILES_FOLDER, COOLSTORE_FOLDER
from files import zip_folder, on_rmtree_error, count_modified_files, append_to_json_file
from logger import get_logger
import s3_handler

logger = get_logger(__name__)

if __name__ == '__main__':
    folders = ['data', 'output', KAI_FILES_FOLDER]
    for folder in folders:
        if os.path.exists(folder):
            shutil.rmtree(folder, onerror=on_rmtree_error)
        os.makedirs(folder)

    start = time.time()

    kai_handler.setup()

    demo_start = time.time()
    kai_handler.run_demo()
    demo_end = time.time()

    if count_modified_files(COOLSTORE_FOLDER) == 0:
        raise Exception('No modified files found')

    kai_eval_handler.download_kai_eval()
    kai_eval_handler.parse_kai_logs()

    evaluation_start = time.time()
    kai_eval_handler.evaluate()
    evaluation_end = time.time()

    json_report = {
        'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'kaiEvalData': None,
        'diffStat': count_modified_files(COOLSTORE_FOLDER),
        'demoExecutionTime': demo_end - demo_start,
        'evaluationExecutionTime': 0
    }
    s3_handler.download("report.json", "data/report.json")
    try:
        kai_eval_handler.generate_report()
        with open("data/kai-report.json", 'r', encoding='utf-8') as file:
            evaluation_data = json.load(file)
        json_report['kaiEvalData'] = evaluation_data
    except Exception as e:
        logger.error(e)
    finally:
        append_to_json_file('./data/report.json', json_report)

    os.rename(f"{KAI_FOLDER}/logs", 'data/logs')
    os.rename(COOLSTORE_FOLDER, 'data/coolstore')

    if os.path.exists(f"{KAI_FOLDER}/example/kai-analyzer.log"):
        os.rename(f"{KAI_FOLDER}/example/kai-analyzer.log", 'data/logs/kai-analyzer.log')

    try:
        zip_name = datetime.now().strftime('%Y-%m-%d--%H-%M')
        zip_path = zip_folder('data', zip_name, 'output')
        report_data_url = s3_handler.upload(zip_path, zip_path.replace("\\", "/"))
        logger.info(f'Run data uploaded to {report_data_url}')

        s3_handler.delete('report.json')
        s3_handler.upload('./data/report.json', "report.json")

        logger.info(f'JSON report updated')
    except Exception as e:
        logger.error(f"Data uploading failed")
        logger.error(e)
    logger.info(f'Test execution took {time.time() - start} seconds')
