const xml2js = require('xml2js');
const moment = require('moment-timezone');
const utils = require('./utils.js');
const signer = require('./signer.js');
const Summary = require('./voucher/summary.js');

class Voucher {
  constructor(voucher) {
    this.cert = voucher.cert;
    this.api = voucher.api;
    this.date = voucher.date ? moment.tz(voucher.date, 'America/Costa_Rica') : moment.tz('America/Costa_Rica');
    this.issuer = voucher.issuer;
    this.headquarters = voucher.headquarters ? voucher.headquarters : 1;
    this.terminal = voucher.terminal ? voucher.terminal : 1;
    this.number = voucher.number;
    this.situation = voucher.situation ? voucher.situation : '1';
    this.activityCode = voucher.activityCode;
    this.securityCode = voucher.securityCode;
    if (voucher.receiver) { this.receiver = voucher.receiver; }
    this.condition = voucher.condition ? voucher.condition : '01';
    this.paymentType = voucher.paymentType ? voucher.paymentType : '01';
    if (voucher.creditTerm) { this.creditTerm = voucher.creditTerm; }
    if (voucher.items) { this.items = voucher.items; }
    if (voucher.otherCharges) { this.otherCharges = voucher.otherCharges; }
    if (voucher.summary) { this.summary = voucher.summary; } else { this.generateSummary(); }
    if (voucher.references) { this.references = voucher.references; }
    if (voucher.others) { this.others = voucher.others; }
  }

  buildXml() {
    const voucher = {
      [this.rootTag]: {
        $: this.namespaces,
      },
    };
    voucher[this.rootTag].Clave = this.key;
    voucher[this.rootTag].CodigoActividad = this.activityCode;
    voucher[this.rootTag].NumeroConsecutivo = this.sequence;
    voucher[this.rootTag].FechaEmision = this.date.format();
    voucher[this.rootTag].Emisor = this.issuer.generate();
    if (this.receiver) { voucher[this.rootTag].Receptor = this.receiver.generate(); }
    voucher[this.rootTag].CondicionVenta = this.condition;
    if (this.creditTerm && this.condition === '02') { voucher[this.rootTag].PlazoCredito = this.creditTerm; }
    voucher[this.rootTag].MedioPago = this.paymentType;
    if (this.items) {
      const lines = [];
      this.items.forEach((item) => {
        lines.push(item.generate());
      });
      voucher[this.rootTag].DetalleServicio = { LineaDetalle: lines };
    }
    if (this.OtrosCargos) {
      const charges = [];
      this.otherCharges.forEach((charge) => {
        charges.push(charge.generate());
      });
      voucher[this.rootTag].OtrosCargos = charges;
    }
    voucher[this.rootTag].ResumenFactura = this.summary
      ? this.summary.generate()
      : this.generateSummary({
        items: voucher[this.rootTag].DetalleServicio.LineaDetalle,
        otherCharges: voucher[this.rootTag].OtrosCargos,
      });
    if (this.references) {
      const references = [];
      this.references.forEach((reference) => {
        references.push(reference.generate());
      });
      voucher[this.rootTag].InformacionReferencia = references;
    }
    if (this.others) { voucher[this.rootTag].Otros = this.others.generate(); }
    const builder = new xml2js.Builder();
    const xmlString = builder.buildObject(voucher);
    this.data = voucher;
    return xmlString.replace(/[\r\n]/g, '').replace(/\s{2,}/g, '');
  }

  generateSequence() {
    const headquarters = utils.zfill(this.headquarters, 3);
    const terminal = utils.zfill(this.terminal, 5);
    const type = utils.zfill(this.voucherType, 2);
    const number = utils.zfill(this.number, 10);
    this.sequence = headquarters + terminal + type + number;
  }

  generateKey() {
    const country = '506';
    const day = utils.zfill(this.date.date(), 2);
    const month = utils.zfill(this.date.month() + 1, 2);
    const year = utils.zfill((this.date.year() - 2000), 2);
    const idNumber = utils.zfill(this.issuer.id, 12);

    const type = utils.zfill(this.situation, 1);
    const securityCode = utils.zfill(this.securityCode, 8);

    this.key = country + day + month + year + idNumber + this.sequence + type + securityCode;
  }

  generateSummary() {
    let servicesTaxableTotal = 0;
    let servicesExentTotal = 0;
    const servicesExoneTotal = 0;
    let goodsTaxableTotal = 0;
    let goodsExentTotal = 0;
    const goodsExoneTotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    const otherChargesTotal = 0;
    this.items.forEach((item) => {
      if (item.taxes) {
        if (item.unit === 'Al' || item.unit === 'Alc' || item.unit === 'Cm' || item.unit === 'I' || item.unit === 'Os' || item.unit === 'Sp' || item.unit === 'Spe' || item.unit === 'St') {
          servicesTaxableTotal += item.subtotal;
        } else {
          goodsTaxableTotal += item.subtotal;
        }
        taxTotal += item.taxNet;
      } else if (item.unit === 'Al' || item.unit === 'Alc' || item.unit === 'Cm' || item.unit === 'I' || item.unit === 'Os' || item.unit === 'Sp' || item.unit === 'Spe' || item.unit === 'St') {
        servicesExentTotal += item.subtotal;
      } else {
        goodsExentTotal += item.subtotal;
      }
      if (item.discount) { discountTotal += item.discount; }
    });
    this.summary = new Summary({
      servicesTaxableTotal,
      servicesExentTotal,
      servicesExoneTotal,
      goodsTaxableTotal,
      goodsExentTotal,
      goodsExoneTotal,
      discountTotal,
      taxTotal,
      otherChargesTotal,
    });
  }

  sign() {
    return new Promise((resolve, reject) => {
      signer.signXmlString(this.buildXml(), this.cert)
        .then((signedXml) => {
          this.signedXml = signedXml;
          this.signedXmlBase64 = Buffer.from(signedXml).toString('base64');
          resolve(signedXml);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getPayload() {
    if (!this.signedXmlBase64) {
      throw Error('the document has not been signed yet');
    }
    const payload = {
      clave: this.key,
      fecha: this.date.format(),
      emisor: {
        tipoIdentificacion: this.issuer.idType,
        numeroIdentificacion: this.issuer.id,
      },
    };
    if (this.receiver) {
      payload.receptor = {
        tipoIdentificacion: this.receiver.idType,
        numeroIdentificacion: this.receiver.id,
      };
    }
    payload.comprobanteXml = this.signedXmlBase64;
    return payload;
  }

  send() {
    return new Promise((resolve, reject) => {
      this.sign()
        .then(() => this.api.send(this.getPayload()))
        .then(() => {
          resolve({ data: this.data, xml: this.signedXmlBase64 });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

module.exports = Voucher;
