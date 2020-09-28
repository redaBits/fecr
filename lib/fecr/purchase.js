const Voucher = require('./voucher.js');
const utils = require('./utils.js');

class Purchase extends Voucher {
  constructor(purchase) {
    super(purchase);
    this.rootTag = 'FacturaElectronicaCompra';
    this.namespaces = {
      xmlns: 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.3/facturaElectronicaCompra',
      'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    };
    this.voucherType = 8;
    if (purchase.sequence) { this.sequence = purchase.sequence; } else { this.generateSequence(); }
    if (purchase.key) { this.key = purchase.key; } else { this.generateKey(); }
  }

  generateKey() {
    const country = '506';
    const day = utils.zfill(this.date.date(), 2);
    const month = utils.zfill(this.date.month() + 1, 2);
    const year = utils.zfill((this.date.year() - 2000), 2);
    const idNumber = utils.zfill(this.receiver.id, 12);

    const type = utils.zfill(this.situation, 1);
    const securityCode = utils.zfill(this.securityCode, 8);

    this.key = country + day + month + year + idNumber + this.sequence + type + securityCode;
  }

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

module.exports = Purchase;
