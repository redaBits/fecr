const axios = require('axios');
const qs = require('querystring');

class Api {
  constructor(api) {
    this.user = api.user;
    this.pass = api.pass;
    this.environment = api.environment ? api.environment : 'stag';
    this.token = api.token;
    this.expires = api.expires;
    this.refresh = api.refresh;
    this.refreshExpires = api.refreshExpires;
    if (this.environment === 'prod') {
      this.clientId = 'api-prod';
      this.vouchersEndpoint = 'https://api.comprobanteselectronicos.go.cr/recepcion/v1/'; // 'https://api.comprobanteselectronicos.go.cr/recepcion-sandbox/v1';
      this.authEndpoint = 'https://idp.comprobanteselectronicos.go.cr/auth/realms/rut/protocol/openid-connect/token'; // 'https://idp.comprobanteselectronicos.go.cr/auth/realms/rut-stag/protocol/openid-connect/token';
      this.logoutEndpoint = 'https://idp.comprobanteselectronicos.go.cr/auth/realms/rut/protocol/openid-connect/logout';
    } else {
      this.clientId = 'api-stag';
      this.vouchersEndpoint = 'https://api.comprobanteselectronicos.go.cr/recepcion-sandbox/v1/';
      this.authEndpoint = 'https://idp.comprobanteselectronicos.go.cr/auth/realms/rut-stag/protocol/openid-connect/token';
      this.logoutEndpoint = 'https://idp.comprobanteselectronicos.go.cr/auth/realms/rut-stag/protocol/openid-connect/logout';
    }
  }

  getToken() {
    return new Promise((resolve, reject) => {
      if (this.refresh) {
        if (this.expires < Date.now() && this.refreshExpires > Date.now()) {
          this.refreshToken()
            .then(() => { resolve(this.token); })
            .catch((error) => { reject(error); });
        } else if (this.expires < Date.now() && this.refreshExpires < Date.now()) {
          this.newToken()
            .then(() => { resolve(this.token); })
            .catch((error) => {
              reject(error);
            });
        } else if (this.token) {
          resolve(this.token);
        } else {
          this.newToken()
            .then(() => { resolve(this.token); })
            .catch((error) => {
              reject(error);
            });
        }
      } else {
        if (this.token) { resolve(this.token); }
        this.newToken()
          .then(() => { resolve(this.token); })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }

  newToken() {
    return new Promise((resolve, reject) => {
      if (this.token) { resolve(this.token); }
      const data = {
        grant_type: 'password',
        client_id: this.clientId,
        username: this.user,
        password: this.pass,
        client_secret: '',
        scope: '',
      };
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        charset: 'utf-8',
      };
      axios.post(this.authEndpoint, qs.stringify(data), { headers })
        .then((response) => {
          this.token = response.data.access_token;
          this.expires = Date.now() + (response.data.expires_in * 1000);
          this.refresh = response.data.refresh_token;
          this.refreshExpires = Date.now() + (response.data.refresh_expires_in * 1000);
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  refreshToken() {
    return new Promise((resolve, reject) => {
      const data = {
        grant_type: 'refresh_token',
        client_id: this.clientId,
        refresh_token: this.refresh,
      };
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        charset: 'utf-8',
      };
      axios.post(this.authEndpoint, qs.stringify(data), { headers })
        .then((response) => {
          this.token = response.data.access_token;
          this.expires = Date.now() + (response.data.expires_in * 1000);
          this.refresh = response.data.refresh_token;
          this.refreshExpires = Date.now() + (response.data.refresh_expires_in * 1000);
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  logout() {
    return new Promise((resolve, reject) => {
      const data = {
        client_id: this.clientId,
        refresh_token: this.refresh,
      };
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        charset: 'utf-8',
      };
      axios.post(this.logoutEndpoint, qs.stringify(data), { headers })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  send(payload) {
    return new Promise((resolve, reject) => {
      this.getToken()
        .then((token) => axios.post(`${this.vouchersEndpoint}recepcion`, payload, { headers: { Authorization: `bearer ${token}` } }))
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  checkStatus(key) {
    return new Promise((resolve, reject) => {
      this.getToken()
        .then((token) => axios.get(`${this.vouchersEndpoint}recepcion/${key}`, { headers: { Authorization: `bearer ${token}` } }))
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

module.exports = Api;
