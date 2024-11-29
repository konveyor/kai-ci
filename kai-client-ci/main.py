import json
import shutil
import time
import os
from datetime import datetime

import pandas as pd

import kai_eval_handler
import kai_handler
from consts import KAI_FOLDER, KAI_FILES_FOLDER
from files import zip_folder
from logger import get_logger
from upload import upload

logger = get_logger(__name__)


# TODO (@abrugaro): Move utility functions to a different module
def to_camel_case(original_str):
    components = original_str.split(' ')
    return components[0].lower() + ''.join(x.title() for x in components[1:])


def kai_eval_report_to_json():
    df = pd.read_csv('output/kai_eval_report.csv')
    df.columns = [to_camel_case(col) for col in df.columns]
    json_data = json.loads(df.to_json(orient='records'))
    total_incidents = len(json_data)
    average_effectiveness = round(sum(item['effectiveness'] for item in json_data) / total_incidents, 1)
    average_specificity = round(sum(item['specificity'] for item in json_data) / total_incidents, 1)
    average_reasoning = round(sum(item['reasoning'] for item in json_data) / total_incidents, 1)
    average_competency = round(sum(item['competency'] for item in json_data) / total_incidents, 1)
    average_score = round(sum(item['averageScore'] for item in json_data) / total_incidents, 1)

    return {
        'averageEffectiveness': average_effectiveness,
        'averageSpecificity': average_specificity,
        'averageReasoning': average_reasoning,
        'averageCompetency': average_competency,
        'averageScore': average_score,
        'data': json_data
    }


def append_to_json_file(file_path, new_data):
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    data.append(new_data)

    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)


if __name__ == '__main__':
    if os.path.exists('data'):
        shutil.rmtree('data')
    os.makedirs('data')

    if os.path.exists(KAI_FILES_FOLDER):
        shutil.rmtree(KAI_FILES_FOLDER)
    os.makedirs(KAI_FILES_FOLDER)

    start = time.time()

    kai_handler.download_kai_release()
    kai_handler.setup_kai_external_files()
    kai_handler.setup_kai_dependencies()

    demo_start = time.time()
    kai_handler.run_demo()
    demo_end = time.time()

    kai_eval_handler.download_kai_eval()
    kai_eval_handler.parse_kai_logs()

    evaluation_start = time.time()
    kai_eval_handler.evaluate()
    evaluation_end = time.time()

    json_report = {
        'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'kaiEvalData': None,
        'demoExecutionTime': demo_end - demo_start,
        'evaluationExecutionTime': evaluation_end - evaluation_start
    }
    try:
        kai_eval_handler.generate_report()
        with open("data/kai-report.json", 'r', encoding='utf-8') as file:
            evaluation_data = json.load(file)
        json_report['kaiEvalData'] = evaluation_data
    except Exception as e:
        logger.error(e)
    finally:
        append_to_json_file('./output/report.json', json_report)

    os.rename(f"{KAI_FOLDER}/logs", 'data/logs')

    if os.path.exists(f"{KAI_FOLDER}/example/kai-analyzer.log"):
        os.rename(f"{KAI_FOLDER}/example/kai-analyzer.log", 'data/logs/kai-analyzer.log')

    zip_path = zip_folder('data', datetime.now().strftime('%Y-%m-%d--%H-%M'), 'output')
    report_data_url = upload(zip_path)
    logger.info(f'Report data uploaded to {report_data_url}')
    logger.info(f'Test execution took {time.time() - start} seconds')
