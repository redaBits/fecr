const Api = require('./fecr/api.js');
const CreditNote = require('./fecr/creditNote.js');
const DebitNote = require('./fecr/debitNote.js');
const Invoice = require('./fecr/invoice.js');
const Message = require('./fecr/message.js');
const pkcs12 = require('./fecr/pkcs12.js');
const signer = require('./fecr/signer.js');
const Ticket = require('./fecr/ticket.js');
const Issuer = require('./fecr/voucher/issuer.js');
const Item = require('./fecr/voucher/item.js');
const Others = require('./fecr/voucher/others.js');
const Receiver = require('./fecr/voucher/receiver.js');
const Reference = require('./fecr/voucher/reference.js');
const Summary = require('./fecr/voucher/summary.js');
const Tax = require('./fecr/voucher/tax.js');
const {
  issueVoucher,
  issueMessage,
  issueMessageFromXML,
  issueDebitFromXML,
  issueCreditFromXML,
} = require('./fecr/issueDocument.js');


const fecr = {
  Api,
  CreditNote,
  DebitNote,
  Invoice,
  Message,
  pkcs12,
  signer,
  Ticket,
  Issuer,
  Item,
  Others,
  Receiver,
  Reference,
  Summary,
  Tax,
  issueVoucher,
  issueMessage,
  issueMessageFromXML,
  issueDebitFromXML,
  issueCreditFromXML,
};

module.exports = fecr;
