const Voucher = require('./voucher.js');

class DebitNote extends Voucher {
  constructor(debitNote) {
    super(debitNote);
    this.rootTag = 'NotaDebitoElectronica';
    this.namespaces = {
      xmlns: 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.3/notaDebitoElectronica',
      'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    };
    this.voucherType = 2;
    if (debitNote.sequence) {
      this.sequence = debitNote.sequence;
    } else {
      this.generateSequence();
    }
    if (debitNote.key) {
      this.key = debitNote.key;
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

module.exports = DebitNote;
