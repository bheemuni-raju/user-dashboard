const moment = require("moment");

const formatName = (name) => {
  return name.toLowerCase().replace(/ /g, "_")
}

const dbMap = {
  "byjus-nucleus": "byjus-nucleus",
  "leado": "byjus-leado",
  "byjusleado": "byjusleado",
  "friendlyPotato": "friendly-potato",
  "friendly-potato": "friendly-potato",
  "byjus-scachieve": "byjus-scachieve",
  "byjus-mkms": "mkms",
}

const dbConnectionMap = {
  "byjus-nucleus": "byjus-nucleus",
  "byjusleado": "leado",
  "friendly-potato": "friendlyPotato",
  "byjus-scachieve": "scAchieve",
  "byjus-mkms": "mkms",
};

const CollectionMap = {
  "apptokens": "AppToken",
  "attendance": "Attendance",
  "byjus_configs": "ByjusConfig",
  "campaigns": "Campaign",
  "cashback_credit_reversals": "CashbackCreditReversal",
  "cibilanalytics": "CibilAnalytics",
  "cities": "City",
  "departments": "Department",
  "employees": "Employee",
  "financebank": "FinanceBank",
  "financecity": "FinanceCity",
  "financestate": "FinanceState",
  "gridtemplates": "GridTemplate",
  "groups": "Group",
  "iiflcitystate": "IIFLCityState",
  "items": "Item",
  "jobdefinitions": "JobDefinition",
  "jobs": "Job",
  "kotakpincode": "KotakPincode",
  "loan_comments": "LoanComments",
  "loan_parked_debits": "LoanParkedDebit",
  "loanmaster": "LoanMaster",
  "loans_collection_summary": "LoanCollectionSummary",
  "login_history": "LoginHistory",
  "message_queues": "MessageQueue",
  "middlewareorders": "MiddlewareOrder",
  "oh_webhook_logs": "OhWebhookLogs",
  "parked_payments": "ParkedPayments",
  "permissionmodules": "PermissionModule",
  "permissiontemplates": "PermissionTemplate",
  "reporttemplates": "ReportTemplate",
  "roles": "Role",
  "skus": "Sku",
  "subdepartments": "SubDepartment",
  "transactions_cashback_credits": "CashbackTransactionCredit",
  "transactions_cashbacks": "CashbackTransaction",
  "transactions_challan": "ChallanTransaction",
  "transactions_cheque": "ChequeTransaction",
  "transactions_lead": "LeadTransaction",
  "transactions_nach": "NachTransaction",
  "transactionsavanse": "AvanseTransaction",
  "transactionsbajaj": "BajajTransaction",
  "transactionsbyjusdirect": "ByjusDirectTransaction",
  "transactionscf": "CfTransaction",
  "transactionscibil": "Cibil",
  "transactionsdebit": "DebitTransaction",
  "transactionsemandate": "EMandate",
  "transactionsenach": "ENachTransaction",
  "transactionsfullerton": "FullertonTransaction",
  "transactionsicici": "ICICITransaction",
  "transactionsiifl": "IIFLTransaction",
  "transactionskotak": "KotakTransaction",
  "transactionspaysense": "PaysenseTransaction",
  "transactionspaytm": "PaytmTransaction",
  "transactionspayu": "PayuTransaction",
  "transactionspennydrop": "PennyDrop",
  "transactionsperfios": "Perfios",
  "transactionspinelabs": "PinelabsTransaction",
  "transactionsrbl": "RblTransaction",
  "transactionszest": "ZestMoneyTransaction",
  "units": "Unit",
  "uploadtemplates": "UploadTemplate",
  "userpreferences": "UserPreference",
  "verticals": "Vertical",
  "clone_orders": "CloneOrder",
  "draft_orders": "DraftOrder",
  "orderhivesalespeople": "OrderhiveSalesPerson",
  "paymentreferences": "PaymentReference",
  "premiumaccounts": "PremiumAccount",
  "productdetails": "ProductDetail",
  "usedmobiles": "UsedMobile",
  "conduction": "Conduction",
  "escalations": "Escalation",
  "inventory": "Inventory",
  "inventory_pic": "InventoryPic",
  "employee_snapshot": "EmployeeSnapshot",
  "students": "Student"
}

const getCohort = (cycleStartDate, doj, role) => {
  if (role === "bdt") return "cohort_below_0_month";

  if (typeof doj === "string") doj = moment(doj, "YYYY-MM-DD").toDate();

  if (typeof cycleStartDate === "string") cycleStartDate = moment(cycleStartDate, "YYYY-MM-DD").toDate();

  const differenceInTime = cycleStartDate - doj;
  const differenceInDays = differenceInTime / (1000 * 3600 * 24);

  switch (true) {
    case differenceInDays <= 90:
      return "cohort_below_03_month";
    case differenceInDays <= 180:
      return "cohort_between_03_06_month";
    case differenceInDays <= 360:
      return "cohort_between_06_12_month";
    case differenceInDays >= 360:
      return "cohort_above_12_month";
    default:
      return "cohort_analysis_pending";
  }
};

module.exports = {
  formatName,
  dbMap,
  dbConnectionMap,
  CollectionMap,
  getCohort
}