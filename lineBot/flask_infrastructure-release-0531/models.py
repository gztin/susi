import enum


class UserStatus(enum.Enum):
    DISABLE = 0  # "禁用"
    WAIT_FOR_REVIEW = 1  # "審核中"
    ENABLE = 2  # "啟用"
