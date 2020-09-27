const Voucher = require('./voucher.js');

class CreditNote extends Voucher {
  constructor(creditNote) {
    super(creditNote);
    this.rootTag = 'NotaCreditoElectronica';
    this.namespaces = {
      xmlns: 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.3/notaCreditoElectronica',
      'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    };
    this.voucherType = 3;
    if (creditNote.sequence) {
      this.sequence = creditNote.sequence;
    } else {
      this.generateSequence();
    }
    if (creditNote.key) {
      this.key = creditNote.key;
    } else {
      this.generateKey();
    }
  }


  send() {
    return new Promise((resolve, reject) => {
      if (this.references[0].documentType === '10') {
        this.signedXmlBase64 = Buffer.from(this.buildXml()).toString('base64');
        resolve({ data: this.data, xml: this.signedXmlBase64 });
      } else {
        this.sign()
          .then(() => {
            resolve({ data: this.data, xml: this.signedXmlBase64 });
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }
}

module.exports = CreditNote;
