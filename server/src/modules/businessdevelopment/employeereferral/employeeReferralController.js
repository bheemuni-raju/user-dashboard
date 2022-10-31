const { get, isEmpty, size, isArray } = require('lodash');

const RippleHire = require('@byjus-orders/tyrion-plugins/ums/ripplehire/RippleHire');
const RippleHireFoundation = require('@byjus-orders/nfoundation/ums/userreferral/rippleHire');
const { UserReferral } = require('@byjus-orders/nexemplum/ums');

const { criteriaBuilder } = require('../../../common/criteriaBuilder');

const listRhData = async (req, res) => {
  let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select, model } = req.body;
  model = model || req.model;
  filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;

  try {
    const options = {
      page: page || 1,
      limit: limit || 10,
      sort,
      populate,
      select
    }

    const list = await UserReferral.paginate(filter, options);
    res.sendWithMetaData(list);
  } catch (error) {
    throw new Error(error || "Error in fetching data");
  }
}

/**
 * API to create or update entry for RippleHire user 
 */
const updateRhUser = async (req, res) => {
  try {
    let rhData = updateRhUserData(req);
    res.json(rhData);
  }
  catch (error) {
    throw new Error(error);
  }
}

/**
 * Method to create or update entry for RippleHire user 
 */
const updateRhUserData = async (req) => {
  let { department, subDepartment, status, contact, role, vertical } = req.body;
  let allowedRoles = ["bda", "bdat", "team_manager", "senior_manager", "assistant_senior_manager", "agm", "gm", "avp", "director"];
  let allowedVerticals = ["DS Weekend", "BNAT Leads", "K3 Inside Sales", "Qualified Leads", "Trial Classes Leads", "JEE Inside Sales", "DM Leads", "JEE-Weekend", "Inside IAS", "Inside Sales", "DS Weekend CAT+IAS", "Inbound Leads", "Multiple Campaigns", "Qualified Leads Kerala", "Qualified Leads AP&TS"];

  if ((department == 'business_development' && subDepartment == 'sales') || (status == 'non_sales')) {
    let rhUserPayload = RippleHireFoundation.getRhUserPayload(req.body, 'EMP');
    rhUserPayload['phoneNo'] = isEmpty(contact) ? '' : (isArray(contact) ? contact[0] : contact);

    if (!isEmpty(status)) {
      rhUserPayload['employeeStatus'] = ["left", "non_sales"].includes(status) ? "INACTIVE" : "ACTIVE";

      /* Adding role and vertical check for RH Activation */
      if (rhUserPayload['employeeStatus'] === "ACTIVE") {
        if (!(allowedRoles.includes(role) && allowedVerticals.includes(vertical))) {
          rhUserPayload['employeeStatus'] = "INACTIVE"
        }
      }
    }

    if (!isEmpty(rhUserPayload)) {
      // Tyrion Plugin call to activate/deactivate user in RippleHire 
      const rhClient = new RippleHire({
        url: process.env.RH_API_URL,
        accessToken: process.env.RH_ACCESS_TOKEN,
        userDetails: rhUserPayload
      });

      // Nfoundation call to create/update user entry in ums_user_referrals collection
      let rhResponse = await rhClient.updateRhUserDetails();
      if (get(rhResponse, 'statusCode', '') == 200) {
        await RippleHireFoundation.updateRhUserEntry(rhUserPayload, req.user);
      }
    }

    return rhUserPayload;
  }
  else {
    console.log('Employee does not belongs to the Business Development - Sales');
  }
}

module.exports = {
  updateRhUser,
  updateRhUserData,
  listRhData
}