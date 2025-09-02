

import { TokenCookie } from './cookies';

// Token相关方法
export const getToken = () => {
  return TokenCookie.getAccessToken();
}

// 用户凭证相关方法
const USER_NAME_KEY = 'savedUserName';
const PASSWORD_KEY = 'savedPassword';
const REMEMBER_ME_KEY = 'rememberMe';

export const saveUserCredentials = (username: string, password: string) => {
  localStorage.setItem(USER_NAME_KEY, username);
  localStorage.setItem(PASSWORD_KEY, password);
  localStorage.setItem(REMEMBER_ME_KEY, 'true');
}

export const clearUserCredentials = () => {
  localStorage.removeItem(USER_NAME_KEY);
  localStorage.removeItem(PASSWORD_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
}

export const getSavedUserCredentials = () => {
  const username = localStorage.getItem(USER_NAME_KEY);
  const password = localStorage.getItem(PASSWORD_KEY);
  const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';

  return {
    username,
    password,
    rememberMe
  };
}
