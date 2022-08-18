const { queryBasicStat, queryFullStat } = require('/mc-server-query.js');
const { serverStatus } = require('/mc-server-status.js');

exports.queryBasicStat = queryBasicStat;

exports.queryFullStat = queryFullStat;

exports.serverStatus = serverStatus;
