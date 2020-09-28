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
      TipoCambio: this.exchangeRate,
    };
    obj.TotalServGravados = this.servicesTaxableTotal;
    obj.TotalServExentos = this.servicesExentTotal;
    obj.TotalServExonerado = this.servicesExoneTotal;
    obj.TotalMercanciasGravadas = this.goodsTaxableTotal;
    obj.TotalMercanciasExentas = this.goodsExentTotal;
    obj.TotalMercExonerada = this.goodsExoneTotal;
    obj.TotalGravado = this.taxableTotal;
    obj.TotalExento = this.exentTotal;
    obj.TotalExonerado = this.exoneTotal;
    obj.TotalVenta = this.subtotal;
    obj.TotalDescuentos = this.discountTotal;
    obj.TotalVentaNeta = this.grossTotal;
    obj.TotalImpuesto = this.taxTotal;
    if (this.vatReturned) { obj.TotalIVADevuelto = this.vatReturned; }
    obj.TotalOtrosCargos = this.otherChargesTotal;
    obj.TotalComprobante = this.netTotal;
    return obj;
  }
}

module.exports = Summary;
