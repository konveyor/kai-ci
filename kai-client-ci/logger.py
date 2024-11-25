import logging


def get_logger(name: str, level: str = 'DEBUG') -> logging.Logger:
    logger = logging.getLogger(name)

    if not logger.handlers:
        formatter = logging.Formatter(
            '%(levelname)s - %(asctime)s - %(name)s - '
            '[%(filename)20s:%(lineno)-4s - %(funcName)20s()] - %(message)s'
        )
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

    logger.setLevel(level)
    return logger
