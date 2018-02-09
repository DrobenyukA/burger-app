import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://burger-pwa.firebaseio.com/'
});

export default instance;