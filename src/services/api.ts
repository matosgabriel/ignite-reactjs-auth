import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';

let cookies = parseCookies();
let isRefreshing = false;
let faildRequestsQueue = [];

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['auth.token']}`,
  },
});

interface ErrorResponseData {
  code: string;
  error: boolean;
  message: string;
}

// Intercepts an response after getting her from back-end
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const { code: errorResponseCode } = error.response
      .data as ErrorResponseData;

    if (error.response.status == 401) {
      if (errorResponseCode === 'token.expired') {
        // Refresh token strategy
        cookies = parseCookies();

        const { 'auth.refreshToken': refreshToken } = cookies;
        const originalConfig = error.config;

        // Prevent refresh attempts while the token is already being refreshed
        if (!isRefreshing) {
          isRefreshing = true;

          api
            .post('/refresh', { refreshToken })
            .then((response) => {
              const { token: newToken, refreshToken: newRefreshToken } =
                response.data;

              setCookie(undefined, 'auth.token', newToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
              });

              setCookie(undefined, 'auth.refreshToken', newRefreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
              });

              api.defaults.headers['Authorization'] = `Bearer ${newToken}`;

              faildRequestsQueue.forEach((request) =>
                request.onSuccess(newToken)
              );
              faildRequestsQueue = [];
            })
            .catch((err) => {
              faildRequestsQueue.forEach((request) => request.onFailure(err));
              faildRequestsQueue = [];
            })
            .finally(() => {
              isRefreshing = false;
            });
        }

        return new Promise((resolve, reject) => {
          faildRequestsQueue.push({
            onSuccess: (token: string) => {
              originalConfig.headers['Authorization'] = `Bearer ${token}`;

              resolve(api(originalConfig));
            },
            onFailure: (err: AxiosError) => {
              reject(err);
            },
          });
        });
      } else {
        // Sign out user
      }
    }
  }
);
