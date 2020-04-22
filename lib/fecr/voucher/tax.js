class Tax {
  constructor(tax) {
    this.code = tax.code;
    this.rateCode = tax.rateCode;
    this.rate = tax.rate;
    this.taxFactor = tax.taxFactor;
    this.total = tax.total;
  }

  generate() {
    const obj = {};
    obj.Codigo = this.code;
    obj.CodigoTarifa = this.rateCode;
    obj.Tarifa = this.rate;
    obj.FactorIVA = this.taxFactor;
    obj.Monto = this.total;

    return obj;
  }
}
module.exports = Tax;
