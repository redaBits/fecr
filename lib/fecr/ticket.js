const Voucher = require('./voucher.js');

class Ticket extends Voucher {
  constructor(ticket) {
    super(ticket);
    this.rootTag = 'TiqueteElectronico';
    this.namespaces = {
      xmlns: 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.3/tiqueteElectronico',
      'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    };
    this.voucherType = 4;
    if (ticket.sequence) { this.sequence = ticket.sequence; } else { this.generateSequence(); }
    if (ticket.key) { this.key = ticket.key; } else { this.generateKey(); }
  }
}

module.exports = Ticket;
