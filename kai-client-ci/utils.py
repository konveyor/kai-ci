import platform

from logger import get_logger

logger = get_logger(__name__)

def is_windows():
    return platform.system().lower() == "windows"