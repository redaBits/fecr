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
}

module.exports = CreditNote;
