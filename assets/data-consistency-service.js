(() => {
  "use strict";

  const number = value => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const positive = value => Math.max(0, number(value));
  const activeServices = order => (Array.isArray(order?.services) ? order.services : [])
    .filter(service => service && service.status !== "已取消" && positive(service.fee) > 0);
  const recordsFor = (order, payments = []) => (Array.isArray(payments) ? payments : [])
    .filter(payment => String(payment?.orderId || "") === String(order?.id || ""));

  function selectFinancials(order, payments = []) {
    const records = recordsFor(order, payments);
    const orderTotal = positive(order?.total);
    const openingPaid = positive(order?.openingPaid);
    const chargeRecords = records.filter(payment => payment.type === "加收費用" && positive(payment.amount) > 0);
    const receiptRecords = records.filter(payment => payment.type !== "加收費用" && number(payment.amount) > 0);
    const refundRecords = records.filter(payment => number(payment.amount) < 0);
    const manualAdditionalCharges = chargeRecords.reduce((sum, payment) => sum + positive(payment.amount), 0);
    const serviceCharges = activeServices(order).reduce((sum, service) => sum + positive(service.fee), 0);
    const additionalCharges = manualAdditionalCharges + serviceCharges;
    const receipts = receiptRecords.reduce((sum, payment) => sum + positive(payment.amount), 0);
    const refunds = refundRecords.reduce((sum, payment) => sum + Math.abs(number(payment.amount)), 0);
    const depositReceipts = receiptRecords
      .filter(payment => payment.type === "訂金")
      .reduce((sum, payment) => sum + positive(payment.amount), 0);
    const adjustedTotal = orderTotal + additionalCharges;
    const paidAmount = Math.max(0, openingPaid + receipts - refunds);
    const remainingAmount = Math.max(0, adjustedTotal - paidAmount);
    const overpaidAmount = Math.max(0, paidAmount - adjustedTotal);
    const settledChargeRecords = chargeRecords.filter(payment => payment.verified === true);

    return Object.freeze({
      orderTotal,
      openingPaid,
      receipts,
      refunds,
      depositAmount: openingPaid + depositReceipts,
      manualAdditionalCharges,
      serviceCharges,
      additionalCharges,
      adjustedTotal,
      paidAmount,
      remainingAmount,
      overpaidAmount,
      paymentStatus: selectPaymentStatus({ adjustedTotal, paidAmount, remainingAmount, overpaidAmount }),
      records,
      chargeRecords,
      settledChargeRecords,
      receiptRecords,
      refundRecords
    });
  }

  function selectPaymentStatus(financials) {
    if (positive(financials.adjustedTotal) === 0) return "免費";
    if (positive(financials.overpaidAmount) > 0) return "溢收";
    if (positive(financials.remainingAmount) === 0) return "已收款";
    if (positive(financials.paidAmount) > 0) return "部分收款";
    return "未收款";
  }

  function deriveOpeningPaid(order, requestedPaid, payments = []) {
    const transactionNet = recordsFor(order, payments).reduce((sum, payment) => {
      return payment.type === "加收費用" ? sum : sum + number(payment.amount);
    }, 0);
    return Math.max(0, positive(requestedPaid) - Math.max(0, transactionNet));
  }

  function synchronizeOrder(order, payments = []) {
    const financials = selectFinancials(order, payments);
    order.total = financials.orderTotal;
    order.openingPaid = financials.openingPaid;
    // paid is a compatibility projection only. It must never be treated as an independent source.
    order.paid = Math.min(financials.adjustedTotal, financials.paidAmount);
    order.paymentStatus = financials.paymentStatus;
    return financials;
  }

  function selectCheckinPaymentState(order, payments = []) {
    const financials = selectFinancials(order, payments);
    return Object.freeze({
      depositComplete: financials.depositAmount > 0 && financials.paidAmount > 0,
      balanceComplete: financials.adjustedTotal > 0 && financials.remainingAmount === 0 && financials.overpaidAmount === 0,
      financials
    });
  }

  window.Meiyuan6DataConsistency = Object.freeze({
    selectFinancials,
    selectPaymentStatus,
    selectCheckinPaymentState,
    deriveOpeningPaid,
    synchronizeOrder
  });
})();
