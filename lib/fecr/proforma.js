const Voucher = require("./voucher.js");

class Proforma extends Voucher {
  constructor(ticketRS) {
    super(ticketRS);
    this.rootTag = "FacturaProforma";
    this.namespaces = {
      "xmlns": "https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.3/facturaProforma",
      "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
      "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    };
    this.voucherType = 11;
    if (ticketRS.sequence) {
      this.sequence = ticketRS.sequence;
    } else {
      this.generateSequence();
    }
    if (ticketRS.key) {
      this.key = ticketRS.key;
    } else {
      this.generateKey();
    }
  }

  send() {
    return new Promise((resolve) => {
      this.signedXmlBase64 = Buffer.from(this.buildXml()).toString("base64");
      resolve({data: this.data, xml: this.signedXmlBase64});
    });
  }
}

module.exports = Proforma;
