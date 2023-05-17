enum errors {
    SHORT_PASSWORD = "Password too short.",
    EMAIL_ALREADY_REGISTERED = "The email you entered is already registered. Please use a different email address.",
    INTERNAL_SERVER_ERROR = "Internal server error.",
    INVALID_TOKEN = "Invalid token, please login and try again.",
    WRONG_CREDENTIALS = "Uncorrect username or password.",
    EMAIL_NOT_CONFIRMED = "Please confirm your email first.",
    BAD_REQUEST_REFRESH_TOKEN_MISSING = "Bad request. The refresh token is missing in the cookies.",
    UNAUTHORIZED_INVALID_TOKEN = "Unauthorized, invalid refresh token.",
    WRONG_OLD_PASSEORD = "Wrong password.",
    EMAIL_NOT_PROVIDED = "Please provide your email.",
    USER_NOT_FOUND_WITH_EMAIL = "User not found with this email.",
    UNAUTHORIZED = "Unauthorized, only admin can perform this action.",
    USER_NOT_FOUND ="User not found",
    RESOURCE_NOT_FOUND = "Resource not found",
    UNAUTHORIZED_CAR_RENTERS_ONLY = "Unauthorized, only car renters can perform this action"
}

export default errors