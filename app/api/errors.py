from werkzeug.http import HTTP_STATUS_CODES

def error_response(status_code, message=None):
    response = {'error': HTTP_STATUS_CODES.get(status_code, 'unknown error'), "code": status_code}
    if message:
        response['message'] = message
    return response, status_code

