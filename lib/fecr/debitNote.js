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
}

module.exports = DebitNote;
