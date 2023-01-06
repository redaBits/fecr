class OtherCharges {
  constructor(otherCharges) {
    this.docType = otherCharges.docType;
    this.docNumber = otherCharges.docNumber;
    this.name = otherCharges.name;
    this.detail = otherCharges.detail;
    this.percentage = otherCharges.percentage;
    this.amount = otherCharges.amount;
  }

  generate() {
    const obj = {};
    obj.TipoDocumento = this.docType;
    if (this.docNumber) obj.NumeroIdentidadTercero = this.docNumber;
    if (this.name) obj.NombreTercero = this.name;
    obj.Detalle = this.detail;
    if (this.percentage) obj.Porcentaje = this.percentage;
    obj.MontoCargo = this.amount;

    return obj;
  }
}
module.exports = OtherCharges;
