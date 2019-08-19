//fetching and updating tokens functions
export function getJwtToken() {
    return localStorage.getItem('token');
}

export function saveJwtToken(token) {
    localStorage.setItem('token', token);
}

export function saveRefreshToken(refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
}

export function getRefreshToken() {
    return localStorage.getItem('refreshToken');
}
