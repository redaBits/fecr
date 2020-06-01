class Reference {
  constructor(reference) {
    this.documentType = reference.documentType;
    this.number = reference.number;
    this.date = reference.date;
    this.code = reference.code;
    this.reason = reference.reason;
  }

  generate() {
    const obj = {};
    obj.TipoDoc = this.documentType;
    obj.Numero = this.number;
    obj.FechaEmision = this.date;
    obj.Codigo = this.code;
    obj.Razon = this.reason;
    return obj;
  }
}

module.exports = Reference;
