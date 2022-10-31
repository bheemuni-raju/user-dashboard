const { SalesPic, Employee } = require('@byjus-orders/nexemplum/ums');
const commonController = require('../../../../common/dataController');
const logger = require('../../../../lib/bunyan-logger')('salesPicController');

const createPic = async (req, res) => {
  try {
    const { picEmailId, coveringUserEmail, scope } = req.body;
    const { email } = req.user;
    const coveringUserDetails = await Employee.findOne({ email: coveringUserEmail }, { role: 1 });
    const { role = "" } = coveringUserDetails;
    let coveringUsers = {
      emailId: coveringUserEmail,
      role: role,
      scopes: scope
    };

    const salesPicRecord = new SalesPic({ picEmailId, coveringUsers, status: 'active', createdBy: email, updatedBy: email });
    await salesPicRecord.save();

    res.json({ success: true });
  } catch (error) {
    if (error && error.code === 11000) {
      logger.error({ method: 'createData' }, "Duplicate EmailId", error)
      throw new Error("PIC already exist!")
    }
    logger.error({ method: 'createData' }, "PIC creation failed", error)
    throw new Error(error)
  }
}

  const changePicStatus = async (req, res) => {
    try {
      const { picEmailId, status } = req.body;
      await SalesPic.updateOne({ picEmailId}, {$set:{ status }});
      res.json({ success: true });
    } catch (error) { throw new Error(error); }
  }

  const editCoveringUsers =  async (req, res) => {
    try {
      const { coveringUsers, picEmailId } = req.body;
      const { email } = req.user;

      let coveringUsersWithRole = await Promise.all(coveringUsers.map(async coveringUser => {
        let { role, emailId} = coveringUser;

        if (role === '') {
          employeeDetails = await Employee.findOne({ email: emailId }, { role: 1 });
          coveringUser.role = employeeDetails.role;
        }

        return coveringUser;
      }));

      await SalesPic.updateOne({ picEmailId}, {$set:{ coveringUsers: coveringUsersWithRole, updatedBy: email }});

      res.json({ success: true });
    } catch (error) { throw new Error(error); }
  }

  module.exports = {
    ...commonController,
    createPic,
    changePicStatus,
    editCoveringUsers
  };