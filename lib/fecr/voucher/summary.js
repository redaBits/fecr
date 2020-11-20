const { round10 } = require('../utils.js');

class Summary {
  constructor(summary) {
    this.currency = summary.currency ? summary.currency : 'CRC';
    this.exchangeRate = summary.currency === 'CRC' || !summary.currency ? 1 : summary.exchangeRate;
    this.servicesTaxableTotal = summary.servicesTaxableTotal ? summary.servicesTaxableTotal : 0;
    this.servicesExentTotal = summary.servicesExentTotal ? summary.servicesExentTotal : 0;
    this.servicesExoneTotal = summary.servicesExoneTotal ? summary.servicesExoneTotal : 0;
    this.goodsTaxableTotal = summary.goodsTaxableTotal ? summary.goodsTaxableTotal : 0;
    this.goodsExentTotal = summary.goodsExentTotal ? summary.goodsExentTotal : 0;
    this.goodsExoneTotal = summary.goodsExoneTotal ? summary.goodsExoneTotal : 0;
    this.taxableTotal = summary.taxableTotal
      ? summary.taxableTotal
      : this.servicesTaxableTotal + this.goodsTaxableTotal;
    this.exentTotal = summary.exentTotal
      ? summary.exentTotal
      : this.servicesExentTotal + this.goodsExentTotal;
    this.exoneTotal = summary.exoneTotal
      ? summary.exoneTotal
      : this.servicesExoneTotal + this.goodsExoneTotal;
    this.subtotal = summary.subtotal
      ? summary.subtotal
      : this.taxableTotal + this.exentTotal + this.exoneTotal;
    this.discountTotal = summary.discountTotal ? summary.discountTotal : 0;
    this.grossTotal = summary.grossTotal ? summary.grossTotal : this.subtotal - this.discountTotal;
    this.taxTotal = summary.taxTotal ? summary.taxTotal : 0;
    this.vatReturned = summary.vatReturned ? summary.vatReturned : undefined;
    this.otherChargesTotal = summary.otherChargesTotal ? summary.otherChargesTotal : 0;
    this.netTotal = summary.netTotal
      ? summary.netTotal
      : this.grossTotal + this.taxTotal + this.otherChargesTotal;
  }

  generate() {
    const obj = {};
    obj.CodigoTipoMoneda = {
      CodigoMoneda: this.currency,
      TipoCambio: round10(this.exchangeRate),
    };
    obj.TotalServGravados = round10(this.servicesTaxableTotal);
    obj.TotalServExentos = round10(this.servicesExentTotal);
    obj.TotalServExonerado = round10(this.servicesExoneTotal);
    obj.TotalMercanciasGravadas = round10(this.goodsTaxableTotal);
    obj.TotalMercanciasExentas = round10(this.goodsExentTotal);
    obj.TotalMercExonerada = round10(this.goodsExoneTotal);
    obj.TotalGravado = round10(this.taxableTotal);
    obj.TotalExento = round10(this.exentTotal);
    obj.TotalExonerado = round10(this.exoneTotal);
    obj.TotalVenta = round10(this.subtotal);
    obj.TotalDescuentos = round10(this.discountTotal);
    obj.TotalVentaNeta = round10(this.grossTotal);
    obj.TotalImpuesto = round10(this.taxTotal);
    if (this.vatReturned) { obj.TotalIVADevuelto = round10(this.vatReturned); }
    obj.TotalOtrosCargos = round10(this.otherChargesTotal);
    obj.TotalComprobante = round10(this.netTotal);
    return obj;
  }
}

module.exports = Summary;
