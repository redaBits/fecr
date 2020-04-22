const openssl = require('openssl-nodejs');
const fs = require('fs');
const path = require('path');

// 'openssl pkcs12 -in '+p12+' -nodes -passin pass:'+pass

const signer = {
  p12ToPemString(p12, pass) {
    return new Promise((resolve, reject) => {
      openssl(['pkcs12', ' -in ', p12, ' -nodes ', ' -passin ', ` pass:${pass}`], (error, buffer) => {
        if (error.toString()) {
          reject(error.toString());
        } else {
          resolve(buffer.toString());
        }
      });
    });
  },
  copyFileP12(pathP12) {
    return new Promise((resolve, reject) => {
      const basename = path.basename(pathP12);
      fs.copyFile(pathP12, `openssl/${basename}`, (err) => {
        if (err) reject(err);
        resolve(basename);
      });
    });
  },
  pem2js(pem) {
    const key = pem.match(/-----BEGIN PRIVATE KEY-----[\S\s]*?-----END PRIVATE KEY-----/g)[0];
    const chain = pem.match(/-----BEGIN CERTIFICATE-----[\S\s]*?-----END CERTIFICATE-----/g);
    return { key, chain };
  },
  pem2der(pem) {
    const preparedPem = this.preparePem(pem);
    // convert base64 to ArrayBuffer
    return new Uint8Array(Buffer.from(preparedPem, 'base64'));
  },
  preparePem(pem) {
    return pem
      // remove BEGIN/END
      .replace(/-----(BEGIN|END)[\w\d\s]+-----/g, '')
      // remove \r, \n
      .replace(/[\r\n]/g, '');
  },
  getKeyPair(p12Path, pass) {
    return new Promise((resolve, reject) => {
      this.copyFileP12(p12Path)
        .then((newPath) => this.p12ToPemString(newPath, pass))
        .then((pem) => {
          try {
            fs.unlinkSync(`./openssl/${path.basename(p12Path)}`);
          } catch (e) {
            reject(e);
          }
          const keyPairPem = this.pem2js(pem);
          const keyPair = {
            key: this.preparePem(keyPairPem.key),
            x509: this.preparePem(keyPairPem.chain[0]),
          };
          resolve(keyPair);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
};
module.exports = signer;
module.exports.default = signer;
