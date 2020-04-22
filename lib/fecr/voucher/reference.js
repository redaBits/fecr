class Reference {
  constructor(reference) {
    this.document_type = reference.document_type;
    this.number = reference.number;
    this.date = reference.date;
    this.code = reference.code;
    this.reason = reference.reason;
  }

  generate() {
    const obj = {};
    obj.TipoDoc = this.document_type;
    obj.Numero = this.number;
    obj.FechaEmision = this.date;
    obj.Codigo = this.code;
    obj.Razon = this.reason;
    return obj;
  }
}

module.exports = Reference;
