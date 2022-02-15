/*
Async node.js implementation of the UDP Minecraft Server Query Protocol.
? https://dinnerbone.com/blog/2011/10/14/minecraft-19-has-rcon-and-query/
License: MIT
© 2022 Daniel H. Rauhut (0ti)
*/
const dgram = require('dgram');

const { decodeBasicStatPacket, decodeFullStatPacket } = require('./query-util/packet-decode');
const { craftHandshakePacket, craftFullStatPacket, craftBasicStatPacket } = require('./query-util/packet-craft');

/**
 * Query a minecraft server's detailed stats
 * @param {*} host Object wrapping `ip (string)`, `port (int)` and optional `timeout (int) in ms`.
 * @returns {*} map encapsuling the detailed server stats
 * @rejects 'Query timed out' Error or other UDP request error
 */
exports.queryFullStat = async (host) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await makeQuery(host, craftFullStatPacket());
            resolve(decodeFullStatPacket(response));
        } catch (err) {
            reject(err);
        }
    });
}
/**
 * Query a minecraft server's basic stats
 * @param {*} host Object wrapping `ip (string)`, `port (int)` and optional `timeout (int) in ms`.
 * @returns {*} map encapsuling the basic server stats
 * @rejects 'Query timed out' Error or other UDP request error
 */
exports.queryBasicStat = async (host) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await makeQuery(host, craftBasicStatPacket());
            resolve(decodeBasicStatPacket(response));
        } catch (err) {
            reject(err);
        }
    });
}
/**
 * The shared UPD request communication logic. Handles sending UDP packets and listening for responses.
 * @param {*} host object-encapsulated host server data
 * @param {*} packet the packet corresponding to the desired query
 * @returns resolves the promise to the final query response or rejects with an error
 */
async function makeQuery(host, packet) {
    return new Promise((resolve, reject) => {
        const ip = host.host;
        const port = host.port || 25565;
        const timeout = host.timeout || 5000;
        const socket = dgram.createSocket('udp4');

        //set timeout timer
        var timer = setTimeout(() => {
            socket.close();
            reject(new Error(`Server query timed out for server ${ip}`));
        }, timeout)

        //init UDP message listener
        socket.on('message', (msg) => {

            //first message byte 0x09 is handshake
            if (msg[0] == 0x09) {
                //write challenge token to query packet
                let challengeToken = parseInt(msg.toString('utf-8', 5));
                packet.writeInt32BE(challengeToken, 7); //write challenge token to packet

                socket.send(packet, port, ip, (err) => {
                    if (err) reject(new Error(err));
                });
            }

            //first message byte 0x00 is query
            if (msg[0] == 0x00) { //stat query
                clearTimeout(timer);
                socket.close();
                resolve(msg);
            }
        });

        // send handshake to get challenge token
        socket.send(craftHandshakePacket(), port, ip, (err) => {
            if (err) reject(new Error(err));
        });
    });
}
