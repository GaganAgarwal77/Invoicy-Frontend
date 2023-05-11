import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';
// const API_BASE_URL = 'http://localhost:8000';
class ApiService {


    get(url) {
        return axios.get(API_BASE_URL + url);
    }

    getAuth(url,  token) {
        return axios.get(API_BASE_URL + url,
            { headers: {
                Authorization: 'Token ' + token}
            });
    }

    post(url, data) { 
        return axios.post(API_BASE_URL + url, data);
    }

    postAuth(url, data, token) {
        return axios.post(API_BASE_URL + url, data, 
            { headers: {
                Authorization: 'Token ' + token}
            });
    }

    put(url, data) {
        return axios.put(API_BASE_URL + url, data);
    }


    patchAuth(url, data, token) {
        return axios.patch(API_BASE_URL + url, data, 
            { headers: {
                Authorization: 'Token ' + token}
            });
    }

    delete(url) {
        return axios.delete(API_BASE_URL + url);
    }
}

export default new ApiService();