const { Crypto } = require('@peculiar/webcrypto');
const xadesjs = require('xadesjs');
const { XMLSerializer } = require('xmldom-alpha');
const pkcs12 = require('./pkcs12.js');

const crypto = new Crypto();
xadesjs.Application.setEngine('NodeJS', new Crypto());

async function singFromKeyPair(keyPair, xmlString) {
  const hash = 'SHA-256';
  const alg = {
    name: 'RSASSA-PKCS1-v1_5',
    hash,
  };

  // Read cert
  const { x509 } = keyPair;

  // Read key
  const keyDer = pkcs12.pem2der(keyPair.key);
  const key = await crypto.subtle.importKey('pkcs8', keyDer.buffer, alg, false, ['sign']);

  // XAdES-EPES
  const xml = xadesjs.Parse(xmlString);

  const xadesXml = new xadesjs.SignedXml();

  const signature = await xadesXml.Sign( // Signing document
    alg, // algorithm
    key, // key
    xml, // document
    { // options
      x509: [x509],
      references: [
        {
          id: 'r-id-1', uri: '', hash, transforms: ['enveloped'],
        },
      ],
      policy: {
        hash,
        identifier: {
          value: 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.3/facturaElectronica',
        },
      },
      signingCertificate: x509,
    },
  );

  // append signature
  xml.documentElement.appendChild(signature.GetXml());

  // serialize XML
  const oSerializer = new XMLSerializer();
  const sXML = oSerializer.serializeToString(xml);
  return sXML.toString();/**/
}

module.exports.signXmlString = (xml, options) => new Promise((resolve, reject) => {
  const { keyPair } = options;
  const { p12 } = options;
  if (keyPair) {
    singFromKeyPair(keyPair, xml)
      .then((xmlSigned) => {
        resolve(xmlSigned);
      })
      .catch((err) => {
        reject(err);
      });
  } else if (p12) {
    pkcs12.getKeyPair(p12.path, p12.pass)
      .then((newKeyPair) => singFromKeyPair(newKeyPair, xml))
      .then((xmlSigned) => {
        resolve(xmlSigned);
      })
      .catch((err) => {
        reject(err);
      });
  } else {
    reject(new Error('keyPair or p12 must to exist'));
  }
});
