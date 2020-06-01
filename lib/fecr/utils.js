module.exports = {
  round10(num, expr) {
    let value = num;
    let exp = expr;
    const type = 'round';
    // Si el exp no está definido o es cero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Si el valor no es un número o el exp no es un entero...
    if (Number.isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(`${value[0]}e${value[1] ? (+value[1] - exp) : -exp}`));
    // Shift back
    value = value.toString().split('e');
    return +(`${value[0]}e${value[1] ? (+value[1] + exp) : exp}`);
  },
  zfill(number, width) {
    const numberOutput = Math.abs(number); /* Valor absoluto del número */
    const { length } = number.toString(); /* Largo del número */
    const zero = '0'; /* String de cero */

    if (width <= length) {
      if (number < 0) {
        return (`-${numberOutput.toString()}`);
      }
      return numberOutput.toString();
    }
    if (number < 0) {
      return (`-${zero.repeat(width - length)}${numberOutput.toString()}`);
    }
    return ((zero.repeat(width - length)) + numberOutput.toString());
  },
  parseVouchers(xml2js) {
    let doc;
    let documentType;
    if (xml2js.FacturaElectronica) {
      doc = xml2js.FacturaElectronica;
      documentType = '01';
    }
    if (xml2js.NotaDebitoElectronica) {
      doc = xml2js.NotaDebitoElectronica;
      documentType = '02';
    }
    if (xml2js.NotaCreditoElectronica) {
      doc = xml2js.NotaCreditoElectronica;
      documentType = '03';
    }
    if (xml2js.TiqueteElectronico) {
      doc = xml2js.TiqueteElectronico;
      documentType = '04';
    }
    const issuer = {
      type: doc.Emisor[0].Identificacion[0].Tipo[0],
      identification: doc.Emisor[0].Identificacion[0].Numero[0],
      name: doc.Emisor[0].Nombre[0],
      tradename: doc.Emisor[0].NombreComercial ? doc.Emisor[0].NombreComercial[0] : null,
      email: doc.Emisor[0].CorreoElectronico[0],
      phone: doc.Emisor[0].Telefono[0].NumTelefono[0],
      location: {
        province: doc.Emisor[0].Ubicacion[0].Provincia[0],
        county: doc.Emisor[0].Ubicacion[0].Canton[0],
        district: doc.Emisor[0].Ubicacion[0].Distrito[0],
        others: doc.Emisor[0].Ubicacion[0].OtrasSenas[0],
      },
    };
    const items = [];
    doc.DetalleServicio[0].LineaDetalle.forEach((item) => {
      const tmpItem = {
        line: item.NumeroLinea[0],
        commercialCode: item.CodigoComercial ? item.CodigoComercial[0].Codigo[0] : null,
        quantity: item.Cantidad[0],
        unit: item.UnidadMedida[0],
        description: item.Detalle[0],
        unitPrice: item.PrecioUnitario[0],
        total: item.MontoTotal[0],
        subtotal: item.SubTotal[0],
        taxableBase: item.BaseImponible[0],
        taxNet: item.ImpuestoNeto[0],
        netTotal: item.MontoTotalLinea[0],
      };
      if (item.Impuesto) {
        const taxesItem = item.Impuesto;
        const taxes = [];
        taxesItem.forEach((tax) => {
          taxes.push({
            code: tax.Codigo[0],
            rateCode: tax.CodigoTarifa[0],
            rate: tax.Tarifa[0],
            total: tax.Monto[0],
          });
        });
        tmpItem.taxes = taxes;
      }
      items.push(tmpItem);
    });
    const summary = {
      currency: doc.ResumenFactura[0].CodigoTipoMoneda
        ? doc.ResumenFactura[0].CodigoTipoMoneda[0].CodigoMoneda[0]
        : null,
      exchangeRate: doc.ResumenFactura[0].CodigoTipoMoneda
        ? doc.ResumenFactura[0].CodigoTipoMoneda[0].TipoCambio[0]
        : null,
      servicesTaxableTotal: doc.ResumenFactura[0].TotalServGravados[0],
      servicesExentTotal: doc.ResumenFactura[0].TotalServExentos[0],
      servicesExoneTotal: doc.ResumenFactura[0].TotalServExonerado[0],
      goodsTaxableTotal: doc.ResumenFactura[0].TotalMercanciasGravadas[0],
      goodsExentTotal: doc.ResumenFactura[0].TotalMercanciasExentas[0],
      goodsExoneTotal: doc.ResumenFactura[0].TotalMercExonerada[0],
      taxableTotal: doc.ResumenFactura[0].TotalGravado[0],
      exentTotal: doc.ResumenFactura[0].TotalExento[0],
      exoneTotal: doc.ResumenFactura[0].TotalExonerado[0],
      subtotal: doc.ResumenFactura[0].TotalVenta[0],
      discountTotal: doc.ResumenFactura[0].TotalDescuentos[0],
      grossTotal: doc.ResumenFactura[0].TotalVentaNeta[0],
      taxTotal: doc.ResumenFactura[0].TotalImpuesto[0],
      vatReturned: doc.ResumenFactura[0].TotalIVADevuelto[0],
      otherChargesTotal: doc.ResumenFactura[0].TotalOtrosCargos[0],
      netTotal: doc.ResumenFactura[0].TotalComprobante[0],
    };
    const voucher = {
      documentType,
      key: doc.Clave[0],
      activityCode: doc.CodigoActividad[0],
      sequence: doc.NumeroConsecutivo[0],
      date: doc.FechaEmision[0],
      issuer,
      condition: doc.CondicionVenta[0],
      creditTerm: doc.PlazoCredito ? doc.PlazoCredito[0] : undefined,
      paymentType: doc.MedioPago[0],
      items,
      summary,
      // regulation: regulation
    };
    if (doc.Receptor) {
      const receiver = {
        type: doc.Receptor[0].Identificacion[0].Tipo[0],
        identification: doc.Receptor[0].Identificacion[0].Numero[0],
        name: doc.Receptor[0].Nombre[0],
        tradename: doc.Receptor[0].NombreComercial ? doc.Receptor[0].NombreComercial[0] : null,
        email: doc.Receptor[0].CorreoElectronico ? doc.Receptor[0].CorreoElectronico[0] : null,
        phone: doc.Receptor[0].Telefono ? doc.Receptor[0].Telefono[0].NumTelefono[0] : null,
      };
      if (doc.Receptor[0].Ubicacion) {
        receiver.location = {
          province: doc.Receptor[0].Ubicacion[0].Provincia[0],
          county: doc.Receptor[0].Ubicacion[0].Canton[0],
          district: doc.Receptor[0].Ubicacion[0].Distrito[0],
          others: doc.Receptor[0].Ubicacion[0].OtrasSenas[0],
        };
      }
      voucher.receiver = receiver;
    }
    if (doc.InformacionReferencia) {
      const references = [];
      doc.InformacionReferencia.forEach((reference) => {
        references.push({
          documentType: reference.TipoDoc[0],
          number: reference.Numero[0],
          date: reference.FechaEmision[0],
          code: reference.Codigo[0],
          reason: reference.Razon[0],
        });
      });
      voucher.references = references;
    }
    return voucher;
  },
};
