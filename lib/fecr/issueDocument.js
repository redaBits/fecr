const Invoice = require('./invoice.js');
const DebitNote = require('./debitNote.js');
const CreditNote = require('./creditNote.js');
const Ticket = require('./ticket.js');
const Message = require('./message.js');
const Issuer = require('./voucher/issuer.js');
const Item = require('./voucher/item.js');
const Others = require('./voucher/others.js');
const Receiver = require('./voucher/receiver.js');
const Reference = require('./voucher/reference.js');
const Summary = require('./voucher/summary.js');
const Tax = require('./voucher/tax.js');
const utils = require('./utils.js')


module.exports = {
  issueVoucher(obj) {
    return new Promise((resolve, reject) => {
      let issuer = new Issuer(obj.issuer);
      let items = [];
      obj.items.forEach((item, index) => {
        let line = {};
        line.number = index + 1;
        if (item.hsCode) { line.hsCode = item.hsCode; }
        if (item.code) { line.code = item.code; }
        if (item.commercialCode) {
          line.typeCommercialCode = item.typeCommercialCode ? item.typeCommercialCode : '04';
          line.commercialCode = item.commercialCode;
        }
        line.quantity = item.quantity;
        line.unit = item.unit;
        if (item.commercialUnit) { line.commercialUnit = item.commercialUnit; }
        line.description = item.description;
        line.unitPrice = item.unitPrice;
        line.total = line.unitPrice * line.quantity;
        if (item.discount) {
          line.discount = item.discount;
          line.discountReason = item.discountReason;
        }
        line.subtotal = line.discount ? line.total - line.discount : line.total ;
        line.taxBase = line.taxBase ? item.taxBase : line.subtotal ;
        let taxNet = 0;
        if (item.taxes) {
          let taxes = [];
          item.taxes.forEach(tax => {
            let rateCode = tax.rateCode;
            let taxFactor = 0;
            let taxTotal = 0;
            let newTax = {};
            let rate = 0;
            if (tax.code === '01' || tax.code === '07') {
              switch (rateCode) {
                case '01':
                  rate = 0;
                  break;
                case '02':
                  rate = 1;
                  break;
                case '03':
                  rate = 2;
                  break;
                case '04':
                  rate = 4;
                  break;
                case '05':
                  rate = 0;
                  break;
                case '06':
                  rate = 4;
                  break;
                case '07':
                  rate = 8;
                  break;
                case '08':
                  rate = 13;
                  break;
                default:
                  rateCode = '08';
                  rate = 13;
                break;
              }
            } else {
              rate = tax.rate
            }
            taxFactor = rate/100;
            taxTotal = round10(line.taxBase * taxFactor, -5);
            newTax.code = tax.code;
            if (rateCode) {newTax.rateCode = rateCode;}
            newTax.rate = rate;
            newTax.taxFactor = taxFactor;
            newTax.total = taxTotal;
            taxNet = taxNet + taxTotal;
            taxes.push(new Tax(newTax));
          });
          line.taxes = taxes;
        }
        line.taxNet = taxNet;
        line.netTotal = line.taxNet + line.subtotal;
        items.push(new Item(line));
      });
      let data = {};
      data.activityCode = obj.activityCode;
      data.api = obj.api;
      data.cert = obj.cert;
      if (obj.condition) {data.condition = obj.condition;}
      if (obj.creditTerm) {data.creditTerm = obj.creditTerm;}
      if (obj.headquarters) {data.headquarters = obj.headquarters;}
      data.issuer = issuer;
      data.items = items;
      data.number = obj.number;
      if (obj.others) {data.others = obj.others;}
      if (obj.paymentType) {data.paymentType = obj.paymentType;}
      if (obj.receiver) {data.receiver = new Receiver(obj.receiver);}
      if (obj.references) {data.references = obj.references;}
      data.securityCode = obj.securityCode
      ? obj.securityCode
      : utils.zfill(Math.floor(Math.random() * 100000000)) ;
      if (obj.situation) {data.situation = obj.situation;}
      if (obj.terminal) {data.terminal = obj.terminal;}
      let voucher;
      switch (obj.type) {
        case 'FE':
          voucher = new Invoice(data);
          break;
        case 'ND':
          voucher = new DebitNote(data);
          break;
        case 'NC':
          voucher = new CreditNote(data);
          break;
        case 'TE':
          voucher = new Ticket(data);
          break;
        default:
          voucher = new Invoice(data);
        break;
      }
      voucher.send()
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      });
    });
  },
  issueMessage(obj) {},
  issueMessageFromXML(obj) {},
  issueDebitFromXML(obj) {},
  issueCreditFromXML(obj) {},
}
