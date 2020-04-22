class Item {
  constructor(item) {
    this.number = item.number;
    if (item.hsCode) { this.hsCode = item.hsCode; }
    if (item.code) { this.code = item.code; }
    if (item.commercialCode) {
      this.typeCommercialCode = item.typeCommercialCode ? item.typeCommercialCode : '04';
      this.commercialCode = item.commercialCode;
    }
    this.quantity = item.quantity;
    this.unit = item.unit;
    if (item.commercialUnit) { this.commercialUnit = item.commercialUnit; }
    this.description = item.description;
    this.unitPrice = item.unitPrice;
    this.total = item.total;
    if (item.discount) {
      this.discount = item.discount;
      this.discountReason = item.discountReason;
    }
    this.subtotal = item.subtotal;
    this.taxBase = item.taxBase;
    if (item.taxes) { this.taxes = item.taxes; }
    this.taxNet = item.taxNet ? item.taxNet : 0;
    this.netTotal = item.netTotal;
  }

  generate() {
    const obj = {};
    obj.NumeroLinea = this.number;
    if (this.code) { obj.Codigo = this.code; }
    if (this.commercialCode) {
      obj.CodigoComercial = {
        Tipo: this.typeCommercialCode,
        Codigo: this.commercialCode,
      };
    }
    obj.Cantidad = this.quantity;
    obj.UnidadMedida = this.unit;
    obj.Detalle = this.description;
    obj.PrecioUnitario = this.unitPrice;
    obj.MontoTotal = this.total;
    if (this.discount) {
      obj.Descuento = {
        MontoDescuento: this.discount,
        NaturalezaDescuento: this.discountReason,
      };
    }
    obj.SubTotal = this.subtotal;
    obj.BaseImponible = this.taxBase;
    if (this.taxes) {
      const iva = [];
      this.taxes.forEach((tax) => {
        iva.push(tax.generate());
      });
      obj.Impuesto = iva;
    }
    obj.ImpuestoNeto = this.taxNet;
    obj.MontoTotalLinea = this.netTotal;

    return obj;
  }
}
module.exports = Item;
