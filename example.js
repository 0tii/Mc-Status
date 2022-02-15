/*
Simple Use Examples
© 2022 Daniel H. Rauhut (0ti)
*/
const { queryFullStat, queryBasicStat } = require('./mc-server-query');
const { serverStatus } = require('./mc-server-status');

//Examples (last checked Feb 14, 2022)
const test1 = { host: 'play.alliummc.org', port: 25565, timeout: 5000 }; //expected: Status & Query
const test2 = { host: '129.146.217.25', port: 25565 }; //expected: Status only

const currentTest = test2;

/*
you have to explicitly catch promise rejections when awaiting query and status, since any error is forwarded, be it connection, timeout or other expected or unexpected ones. 
you can await or then().
*/

(async function () {
    try {
        let info = await queryFullStat(currentTest);
        console.log(info);
    } catch (err) {
        console.log('FullStat Query threw an error:\n\n' + err);
    }
})();

serverStatus(currentTest)
    .then((data) => {
        console.log(data);
    })
    .catch((err) => {
        console.log('Status Query threw an error:\n\n' + err)
    });

