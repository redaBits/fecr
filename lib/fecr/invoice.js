const Voucher = require('./voucher.js');

class Invoice extends Voucher {
  constructor(invoice) {
    super(invoice);
    this.rootTag = 'FacturaElectronica';
    this.namespaces = {
      xmlns: 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.3/facturaElectronica',
      'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    };
    this.voucherType = 1;
    if (invoice.sequence) { this.sequence = invoice.sequence; } else { this.generateSequence(); }
    if (invoice.key) { this.key = invoice.key; } else { this.generateKey(); }
  }
}

module.exports = Invoice;
