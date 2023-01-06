class Allowance {
  constructor(allowance) {
    this.docType = allowance.docType;
    this.docNumber = allowance.docNumber;
    this.institution = allowance.institution;
    this.date = allowance.date;
    this.percentage = allowance.percentage;
    this.amount = allowance.amount;
  }

  generate() {
    const obj = {};
    obj.TipoDocumento = this.docType;
    obj.NumeroDocumento = this.docNumber;
    obj.NombreInstitucion = this.institution;
    obj.FechaEmision = this.date;
    obj.PorcentajeExoneracion = this.percentage;
    obj.MontoExoneracion = this.amount;

    return obj;
  }
}
module.exports = Allowance;
