const { Billing } = require("../models");

const createBilling = async (data) => {
  return await Billing.create(data);
};

const getBillingsByFilter = async (filter) => {
  return Billing.find(filter).sort({ createdAt: -1 });
};

module.exports = {
  createBilling,
  getBillingsByFilter,
};
