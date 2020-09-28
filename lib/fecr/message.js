const xml2js = require('xml2js');
const moment = require('moment');
const utils = require('./utils.js');
const signer = require('./signer.js');

class Message {
  constructor(message) {
    this.cert = message.cert;
    this.api = message.api;
    this.key = message.key;
    this.date = moment();
    this.issuerIdType = message.issuerIdType;
    this.issuerIdNumber = message.issuerIdNumber;
    this.receiverIdType = message.receiverIdType;
    this.receiverIdNumber = message.receiverIdNumber;
    this.message = message.message;
    this.details = message.details;
    this.economicActivity = message.economicActivity;
    this.taxCondition = message.taxCondition;
    this.totalAmountTaxCredit = message.totalAmountTaxCredit;
    this.totalAmountApplicable = message.totalAmountApplicable;
    this.tax = message.tax;
    this.total = message.total;
    this.number = message.number;
    this.headquarters = (message.headquarters) ? message.headquarters : 1;
    this.terminal = (message.terminal) ? message.terminal : 1;
    if (message.sequence) { this.sequence = message.sequence; } else { this.generateSequence(); }
    this.rootTag = 'MensajeReceptor';
    this.namespaces = {
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
      xmlns: 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.3/mensajeReceptor',
    };
  }

  buildXml() {
    const message = {
      [this.rootTag]: {
        $: this.namespaces,
      },
    };

    message[this.rootTag].Clave = this.key;
    message[this.rootTag].NumeroCedulaEmisor = this.issuerIdNumber;
    message[this.rootTag].FechaEmisionDoc = this.date.format();
    message[this.rootTag].Mensaje = this.message;
    if (this.details) { message[this.rootTag].DetalleMensaje = this.details; }
    if (this.tax) { message[this.rootTag].MontoTotalImpuesto = this.tax; }
    if (this.economicActivity) { message[this.rootTag].CodigoActividad = this.economicActivity; }
    if (this.taxCondition) { message[this.rootTag].CondicionImpuesto = this.taxCondition; }
    if (this.totalAmountTaxCredit) {
      message[this.rootTag].MontoTotalImpuestoAcreditar = this.totalAmountTaxCredit;
    }
    if (this.totalAmountApplicable) {
      message[this.rootTag].MontoTotalDeGastoAplicable = this.totalAmountApplicable;
    }
    message[this.rootTag].TotalFactura = this.total;
    message[this.rootTag].NumeroCedulaReceptor = this.receiverIdNumber;
    message[this.rootTag].NumeroConsecutivoReceptor = this.sequence;

    const builder = new xml2js.Builder();
    const xmlString = builder.buildObject(message);
    this.data = message;
    return xmlString.replace(/[\r\n]/g, '').replace(/\s{2,}/g, '');
  }

  generateSequence() {
    let messageType;
    switch (this.message) {
      case 1:
        messageType = 5;
        break;
      case 2:
        messageType = 6;
        break;
      case 3:
        messageType = 7;
        break;
      default:
        messageType = 5;
        break;
    }
    const headquarters = utils.zfill(this.headquarters, 3);
    const terminal = utils.zfill(this.terminal, 5);
    const type = utils.zfill(messageType, 2);
    const number = utils.zfill(this.number, 10);
    this.sequence = headquarters + terminal + type + number;
  }

  sign() {
    return new Promise((resolve, reject) => {
      signer.signXmlString(this.buildXml(), this.cert)
        .then((signedXml) => {
          this.signedXml = signedXml;
          this.signedXmlBase64 = Buffer.from(signedXml).toString('base64');
          resolve(signedXml);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getPayload() {
    if (!this.signedXmlBase64) {
      throw new Error('the document has not been signed yet');
    }
    const payload = {
      clave: this.key,
      fecha: this.date.format(),
      emisor: {
        tipoIdentificacion: this.issuerIdType,
        numeroIdentificacion: this.issuerIdNumber,
      },
      receptor: {
        tipoIdentificacion: this.receiverIdType,
        numeroIdentificacion: this.receiverIdNumber,
      },
      consecutivoReceptor: this.sequence,
    };
    payload.comprobanteXml = this.signedXmlBase64;
    return payload;
  }

  /* send() {
    return new Promise((resolve, reject) => {
      this.sign()
        .then(() => this.api.send(this.getPayload()))
        .then(() => {
          resolve({ data: this.data, xml: this.signedXmlBase64 });
        })
        .catch((error) => {
          reject(error);
        });
    });
  } /* */
  send() {
    return new Promise((resolve) => {
      this.signedXmlBase64 = Buffer.from(this.buildXml()).toString('base64');
      resolve({ data: this.data, xml: this.signedXmlBase64 });
      /* this.sign()
        .then(() => {
          resolve({ data: this.data, xml: this.signedXmlBase64 });
        })
        .catch((error) => {
          reject(error);
        });/* */
    });
  }
}

module.exports = Message;
