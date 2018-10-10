import jwt from 'jsonwebtoken'
import serverSettings from './settings'

const TOKEN_PAYLOAD = {email: 'admin@chakirhospitality.com', scopes: ['admin']};
const STORE_ACCESS_TOKEN = jwt.sign(TOKEN_PAYLOAD, serverSettings.jwtSecretKey);

const api = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization' : 'Bearer ' + STORE_ACCESS_TOKEN
    },
    url: serverSettings.apiBaseUrl
}

export default api;
