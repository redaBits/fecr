const xml2js = require("xml2js");
const Invoice = require("./invoice.js");
const DebitNote = require("./debitNote.js");
const CreditNote = require("./creditNote.js");
const Purchase = require("./purchase.js");
const Ticket = require("./ticket.js");
const TicketRS = require("./ticketRS.js");
const Proforma = require("./proforma.js");
const Message = require("./message.js");
const Issuer = require("./voucher/issuer.js");
const Item = require("./voucher/item.js");
const Others = require("./voucher/others.js");
const Receiver = require("./voucher/receiver.js");
const Reference = require("./voucher/reference.js");
const Tax = require("./voucher/tax.js");
const Allowance = require("./voucher/allowance.js");
const Api = require("./api.js");
const utils = require("./utils.js");
const ExportVoucher = require("./exportVoucher.js");
const OtherCharges = require("./voucher/otherCharges.js");


module.exports = {
  issueVoucher(obj) {
    return new Promise((resolve, reject) => {
      const issuer = new Issuer(obj.issuer);
      const items = [];
      obj.items.forEach((item, index) => {
        const line = {};
        line.number = index + 1;
        if (item.hsCode) {
          line.hsCode = item.hsCode;
        }
        if (item.code) {
          line.code = item.code;
        }
        if (item.commercialCode) {
          line.typeCommercialCode = item.typeCommercialCode ?
            item.typeCommercialCode : "04";
          line.commercialCode = item.commercialCode;
        }
        line.quantity = item.quantity;
        line.unit = item.unit;
        if (item.commercialUnit) {
          line.commercialUnit = item.commercialUnit;
        }
        line.description = item.description;
        line.unitPrice = utils.round10(item.unitPrice, -5);
        line.total = utils.round10(line.unitPrice * line.quantity, -5);
        let discount = 0;
        if (item.discounts) {
          line.discounts = [];
          item.discounts.forEach(({discountAmount, discountReason}) => {
            discount += utils.round10(discountAmount, -5);
            line.discounts.push({
              discountAmount: utils.round10(discountAmount, -5),
              discountReason,
            });
          });
        }
        line.subtotal = discount > 0 ?
          utils.round10(line.total - discount, -5) : line.total;
        line.taxBase = line.taxBase ?
          utils.round10(item.taxBase, -5) : line.subtotal;
        let taxNet = 0;
        if (item.taxes) {
          const taxes = [];
          item.taxes.forEach((tax) => {
            let {rateCode} = tax;
            const {allowance} = tax;
            let taxFactor = 0;
            let taxTotal = 0;
            const newTax = {};
            let rate = 0;
            if (tax.code === "01" || tax.code === "07") {
              switch (rateCode) {
                case "01":
                  rate = 0;
                  break;
                case "02":
                  rate = 1;
                  break;
                case "03":
                  rate = 2;
                  break;
                case "04":
                  rate = 4;
                  break;
                case "05":
                  rate = 0;
                  break;
                case "06":
                  rate = 4;
                  break;
                case "07":
                  rate = 8;
                  break;
                case "08":
                  rate = 13;
                  break;
                default:
                  rateCode = "08";
                  rate = 13;
                  break;
              }
            } else {
              rate = tax.rate;
            }
            taxFactor = rate / 100;
            taxTotal = utils.round10(line.taxBase * taxFactor, -5);
            newTax.code = tax.code;
            if (rateCode) {
              newTax.rateCode = rateCode;
            }
            newTax.rate = rate;
            newTax.taxFactor = taxFactor;
            newTax.total = taxTotal;
            if (allowance) {
              const amount = utils.round10(
                  line.taxBase * (Number(allowance.percentage)/100), -5,
              );
              newTax.allowance = new Allowance({...allowance, amount});
              taxTotal -= amount;
            }
            taxNet = utils.round10(taxNet + taxTotal, -5);
            taxes.push(new Tax(newTax));
          });
          line.taxes = taxes;
        }
        line.taxNet = utils.round10(taxNet, -5);
        line.netTotal = utils.round10(line.taxNet + line.subtotal, -5);
        items.push(new Item(line));
      });
      const data = {};
      data.activityCode = obj.activityCode;
      data.api = obj.api ? new Api(obj.api) : null;
      data.cert = obj.cert ? obj.cert : null;
      if (obj.condition) {
        data.condition = obj.condition;
      }
      if (obj.creditTerm) {
        data.creditTerm = obj.creditTerm;
      }
      if (obj.headquarters) {
        data.headquarters = obj.headquarters;
      }
      data.issuer = issuer;
      data.items = items;
      if (obj.otherCharges) {
        const otherCharges = [];
        obj.otherCharges.forEach((charge) => {
          otherCharges.push(new OtherCharges(charge));
        });
        data.otherCharges = otherCharges;
      }
      if (obj.others) {
        data.others = new Others({text: obj.others});
      }
      data.number = obj.number;
      if (obj.paymentType) {
        data.paymentType = obj.paymentType;
      }
      if (obj.receiver) {
        data.receiver = new Receiver(obj.receiver);
      }
      if (obj.references) {
        const references = [];
        obj.references.forEach((reference) => {
          references.push(new Reference(reference));
        });
        data.references = references;
      }
      data.securityCode = obj.securityCode ?
        obj.securityCode :
        utils.zfill(Math.floor(Math.random() * 100000000), 9);
      if (obj.situation) {
        data.situation = obj.situation;
      }
      if (obj.terminal) {
        data.terminal = obj.terminal;
      }
      if (obj.currency) {
        data.currency = obj.currency;
      }
      if (obj.exchangeRate) {
        data.exchangeRate = obj.exchangeRate;
      }
      if (obj.callbackUrl) {
        data.callbackUrl = obj.callbackUrl;
      }
      let voucher;
      switch (obj.type) {
        case "FE":
          voucher = new Invoice(data);
          break;
        case "ND":
          voucher = new DebitNote(data);
          break;
        case "NC":
          voucher = new CreditNote(data);
          break;
        case "TE":
          voucher = new Ticket(data);
          break;
        case "FEC":
          voucher = new Purchase(data);
          break;
        case "FEE":
          voucher = new ExportVoucher(data);
          break;
        case "TRS":
          voucher = new TicketRS(data);
          break;
        case "FP":
          voucher = new Proforma(data);
          break;
        default:
          voucher = new Invoice(data);
          break;
      }
      voucher.send()
          .then((dataVoucher) => {
            resolve(dataVoucher);
          })
          .catch((error) => {
            reject(error);
          });
    });
  },
  issueMessage(obj) {
    return new Promise((resolve, reject) => {
      const message = new Message({
        cert: obj.cert,
        api: obj.api,
        key: obj.key,
        issuerIdType: obj.issuerIdType,
        issuerIdNumber: obj.issuerIdNumber,
        receiverIdType: obj.receiverIdType,
        receiverIdNumber: obj.receiverIdNumber,
        message: obj.message,
        details: obj.details,
        economicActivity: obj.economicActivity,
        taxCondition: obj.taxCondition,
        totalAmountTaxCredit: obj.totalAmountTaxCredit,
        totalAmountApplicable: obj.totalAmountApplicable,
        tax: obj.tax,
        total: obj.total,
        number: obj.number,
        headquarters: obj.headquarters,
        terminal: obj.terminal,
      });
      message.send()
          .then((messageData) => {
            resolve(messageData);
          })
          .catch((error) => {
            reject(error);
          });
    });
  },
  issueMessageFromXML(obj) {
    return new Promise((resolve, reject) => {
      const {
        xml,
        base64,
        cert,
        api,
        message, details, taxCondition, number, headquarters, terminal,
      } = obj;
      const stringXml = base64 ?
        Buffer.from(xml, "base64").toString("utf8") : xml;
      xml2js.parseStringPromise(stringXml)
          .then((result) => {
            const data = utils.parseVouchers(result);
            const msj = {
              key: data.key,
              issuerIdType: data.issuer.type,
              issuerIdNumber: data.issuer.identification,
              receiverIdType: data.receiver.type,
              receiverIdNumber: data.receiver.identification,
              message,
              details,
              economicActivity: data.activityCode,
              taxCondition: taxCondition || "01",
              tax: data.summary.taxTotal,
              total: data.summary.netTotal,
              number,
              headquarters,
              terminal,
              cert,
              api,
            };
            return this.issueMessage(msj);
          })
          .then((messageData) => {
            resolve(messageData);
          })
          .catch((error) => {
            reject(error);
          });
    });
  },
  issueDebitFromXML(obj) {
    return new Promise((resolve, reject) => {
      const {
        xml,
        base64,
        reason,
        number,
        headquarters, terminal, cert, api, securityCode, situation,
      } = obj;
      const stringXml = base64 ?
        Buffer.from(base64, "base64").toString("utf8") : xml;
      xml2js.parseStringPromise(stringXml)
          .then((result) => {
            const data = utils.parseVouchers(result);
            const debitNote = {
              type: "ND",
              number,
              terminal,
              headquarters,
              situation,
              condition: data.condition,
              creditTerm: data.creditTerm,
              paymentType: data.paymentType,
              activityCode: data.activityCode,
              securityCode,
              cert,
              api,
            };
            debitNote.issuer = {
              name: data.issuer.name,
              idType: data.issuer.type,
              id: data.issuer.identification,
              location: {
                province: data.issuer.location.province,
                county: data.issuer.location.county,
                district: data.issuer.location.district,
                others: data.issuer.location.others,
              },
              phone: data.phone,
              email: data.email,
            };
            if (data.receiver) {
              debitNote.receiver = {
                name: data.receiver.name,
                idType: data.receiver.type,
                id: data.receiver.identification,
              };
            }
            debitNote.items = [];
            data.items.forEach((item) => {
              const tmpItem = {
                commercialCode: item,
                quantity: item,
                unit: item,
                description: item,
                unitPrice: item,
              };
              if (item.discount) {
                tmpItem.discount = item.discount;
                tmpItem.discountReason = item.discountReason;
              }
              if (item.taxes) {
                const taxes = [];
                item.taxes.forEach((tax) => {
                  taxes.push({
                    code: tax.code,
                    rateCode: tax.rateCode,
                    rate: tax.rate,
                  });
                });
                tmpItem.taxes = taxes;
              }
              debitNote.items.push(tmpItem);
            });
            debitNote.references = data.references ? data.references : [];
            debitNote.references.push({
              documentType: data.documentType,
              number: data.key,
              date: data.date,
              code: "01",
              reason: reason || "Error en los montos",
            });
            return this.issueVoucher(debitNote);
          })
          .then((voucher) => {
            resolve(voucher);
          })
          .catch((error) => {
            reject(error);
          });
    });
  },
  issueCreditFromXML(obj) {
    return new Promise((resolve, reject) => {
      const {
        xml,
        base64,
        reason,
        number, headquarters, terminal, cert, api, securityCode, situation,
      } = obj;
      const stringXml = base64 ?
        Buffer.from(base64, "base64").toString("utf8") : xml;
      xml2js.parseStringPromise(stringXml)
          .then((result) => {
            const data = utils.parseVouchers(result);
            const debitNote = {
              type: "NC",
              number,
              terminal,
              headquarters,
              situation,
              condition: data.condition,
              creditTerm: data.creditTerm,
              paymentType: data.paymentType,
              activityCode: data.activityCode,
              securityCode,
              cert,
              api,
            };
            debitNote.issuer = {
              name: data.issuer.name,
              idType: data.issuer.type,
              id: data.issuer.identification,
              location: {
                province: data.issuer.location.province,
                county: data.issuer.location.county,
                district: data.issuer.location.district,
                others: data.issuer.location.others,
              },
              phone: data.phone,
              email: data.email,
            };
            if (data.receiver) {
              debitNote.receiver = {
                name: data.receiver.name,
                idType: data.receiver.type,
                id: data.receiver.identification,
              };
            }
            debitNote.items = [];
            data.items.forEach((item) => {
              const tmpItem = {
                commercialCode: item,
                quantity: item,
                unit: item,
                description: item,
                unitPrice: item,
              };
              if (item.discount) {
                tmpItem.discount = item.discount;
                tmpItem.discountReason = item.discountReason;
              }
              if (item.taxes) {
                const taxes = [];
                item.taxes.forEach((tax) => {
                  taxes.push({
                    code: tax.code,
                    rateCode: tax.rateCode,
                    rate: tax.rate,
                  });
                });
                tmpItem.taxes = taxes;
              }
              debitNote.items.push(tmpItem);
            });
            debitNote.references = data.references ? data.references : [];
            debitNote.references.push({
              documentType: data.documentType,
              number: data.key,
              date: data.date,
              code: "01",
              reason: reason || "Error en los montos",
            });
            return this.issueVoucher(debitNote);
          })
          .then((voucher) => {
            resolve(voucher);
          })
          .catch((error) => {
            reject(error);
          });
    });
  },
};
