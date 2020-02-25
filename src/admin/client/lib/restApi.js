import settings from 'lib/settings'

const dashboardToken = localStorage.getItem('dashboard_token');
const webstoreToken = localStorage.getItem('webstore_token');

const api = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization' : 'Bearer ' + dashboardToken
    },
    url: settings.apiBaseUrl
}

export default api
