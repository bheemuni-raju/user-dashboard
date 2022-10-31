const { size } = require('lodash');

const { Language } = require('@byjus-orders/npgexemplum');

const { sqlCriteriaBuilder } = require('../../../common/sqlCriteriaBuilder');

const getLanguagesList = async (req, res) => {
    const { page, limit, sort, filter = {}, searchCriterias = [], contextCriterias = [] } = req.body;
    const sqlFilter = size(filter) === 0 ? sqlCriteriaBuilder(searchCriterias, contextCriterias) : filter;
    
    const sqlOrder = Object.keys(sort).map(item => {
      return [item, sort[item]];
    });
  
    try {
      const options = {
        page: page || 1,
        paginate: limit || 10,
        order: sqlOrder,
        where: sqlFilter
      }
  
      const list = await Language.paginate(options)
      res.sendWithMetaData({
        ...list,
        page,
        limit
      });
    } catch (error) {
      throw new Error(error || "Error in fetching data");
    }
  }

module.exports = {
    getLanguagesList
}