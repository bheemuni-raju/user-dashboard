'use strict';

const { diff } = require('deep-diff');
const _ = require('lodash');
const bunyan = require('./bunyan-logger');

const logger = bunyan('history-util');

const logArray = async (changes, kind, user, logs) => {
  changes.forEach(change => {
    let path = '';
    change.path.forEach((p, index) => {
      path += index === 0 ? `${p}` : `.${p}`;
    });
    const expectedLogSchema = {
      entity: path,
      oldValue: change.lhs || null,
      newValue: change.rhs || null,
      changedBy: user,
      changedAt: new Date().toISOString,
      typeOfChange: kind
    };
    logs.push(expectedLogSchema);
  });
  return logs;
};

const changesLogs = async (current, updated, user) => {
  const logs = [];
  logger.info({ method: 'changesLogs' }, 'Entering change log function');
  const differences = diff(current, updated);
  const updateChanges = _.filter(differences, { kind: 'E' });
  const addChanges = _.filter(differences, { kind: 'N' });
  const deletedChanges = _.filter(differences, { kind: 'D' });
  if (updateChanges.length > 0) logArray(updateChanges, 'update', user, logs);
  if (addChanges.length > 0) logArray(addChanges, 'add', user, logs);
  if (deletedChanges.length > 0) logArray(deletedChanges, 'delete', user, logs);
  logger.info({ method: 'changesLogs' }, 'Exiting change log function');
  return logs;
};

module.exports = {
  changesLogs
};
