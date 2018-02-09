import axios from 'axios';

import CONFIG from '../../app.config';

import * as actionTypes from './actionTypes';
import AUTH from '../../constants/auth';

export const authStart = () => {
    return {
        type: AUTH.ACTIONS.START
    };
};

export const authSuccess = (token, userId) => {
    return {
        type: AUTH.ACTIONS.SUCCESS,
        idToken: token,
        userId: userId
    };
};

export const authFail = (error) => {
    return {
        type: AUTH.ACTIONS.FAIL,
        error: error
    };
};

export const logout = () => {
    localStorage.removeItem(AUTH.FIELDS.TOKEN);
    localStorage.removeItem(AUTH.FIELDS.EXPIRATION_DATE);
    localStorage.removeItem(AUTH.FIELDS.USER_ID);
    return {
        type: AUTH.ACTIONS.LOGOUT
    };
};

export const checkAuthTimeout = (expirationTime) => {
    return dispatch => {
        setTimeout(() => {
            dispatch(logout());
        }, expirationTime * 1000);
    };
};

export const auth = (email, password, isSignup) => {
    return dispatch => {
        dispatch(authStart());
        const authData = {
            email: email,
            password: password,
            returnSecureToken: true
        };
        let url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=' + CONFIG.API_KEY;
        if (!isSignup) {
            url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=' + CONFIG.API_KEY;
        }
        axios.post(url, authData)
            .then(response => {
                const expirationDate = new Date(
                    new Date().getTime() + 
                    response.data.expiresIn * 1000
                );
                localStorage.setItem(AUTH.FIELDS.TOKEN, response.data.idToken);
                localStorage.setItem(AUTH.FIELDS.EXPIRATION_DATE, expirationDate);
                localStorage.setItem(AUTH.FIELDS.USER_ID, response.data.localId);
                dispatch(authSuccess(response.data.idToken, response.data.localId));
                dispatch(checkAuthTimeout(response.data.expiresIn));
            })
            .catch(err => {
                dispatch(authFail(err.response.data.error));
            });
    };
};

export const setAuthRedirectPath = (path) => {
    return {
        type: AUTH.ACTIONS.SET_REDIRECT_PATH,
        path: path
    };
};

export const authCheckState = () => {
    return dispatch => {
        const token = localStorage.getItem(AUTH.FIELDS.TOKEN);
        if (!token) {
            dispatch(logout());
        } else {
            const expirationDate = new Date(localStorage.getItem(AUTH.FIELDS.EXPIRATION_DATE));
            if (expirationDate <= new Date()) {
                dispatch(logout());
            } else {
                const userId = localStorage.getItem(AUTH.FIELDS.USER_ID);
                dispatch(authSuccess(token, userId));
                dispatch(checkAuthTimeout(
                    (expirationDate.getTime() - new Date().getTime()) / 1000 
                ));
            }   
        }
    };
};