const Voucher = require('./voucher.js');

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
}

module.exports = Purchase;
