/*
Async Node.js implementation of the Minecraft Server List Ping Protocol
? https://wiki.vg/Server_List_Ping
License: MIT
© 2022 Daniel H. Rauhut (0ti)
*/
const { Buffer } = require('buffer');
const { decodeStatus } = require('./status-util/status-decode');
const Net = require('net');
const Packet = require('./status-util/packet');

/**
 * Request the status of a given host, where the host is a running minecraft java server that may or may not have ``query`` enabled.
 * @param {*} host Host object encapsulating ``host``, ``port`` (optional, defaults to 25565) and ``timeout`` (optional, defaults to 4000 ms). 
 * @returns json representation of server status [next - map of server data]
 */
exports.serverStatus = async (host) => {
    return new Promise((resolve, reject) => {
        const client = new Net.Socket();

        var response = Buffer.alloc(0);
        var streamLength = [];
        var offset = 0;

        let timer = setTimeout(() => {
            reject(new Error(`Connection timed out for host: ${host.host}`));
        }, host.timeout || 4000);

        client.connect(host.port || 25565, host.host, () => {
            client.write(craftHandshakePacket(), () => {
                client.write(craftQueryPacket());
            });
        });

        client.on('data', (chunk) => {

            if (response.byteLength == 0) {
                let packet = new Packet(chunk);
                streamLength = packet.readVarIntL(); //read prepended varint for streamlength
                let jsonLength = packet.readVarIntLAt(streamLength[1] + 1); //json string bytelength
                offset = streamLength[1] + jsonLength[1] + 1; //1 byte packet id, data length, data string bytelength
            }

            response = Buffer.concat([response, chunk]);

            if (response.byteLength == (streamLength[0] + streamLength[1])) {
                response = response.slice(offset);

                try{
                    var json = JSON.parse(response.toString('utf-8'));
                }catch(err){
                    reject(new Error('JSON parse error: Server sent unexpected data.'));
                }

                if(json?.version?.name == 'TCPShield.com') 
                    reject(new Error('Server is running behind TCPShield.'));

                client.destroy();
                clearTimeout(timer);
                resolve(decodeStatus(host, json));
            }
        });

        client.on('error', (err) => {
            client.end();
            reject(err);
        });
    });
}

function craftHandshakePacket() {
    let packet = new Packet();
    packet.writeVarInt(0x00);
    packet.writeVarInt(47);
    packet.writeString('localhost');
    packet.writeShort(25565);
    packet.writeVarInt(1);
    packet.sign();
    return packet.get();
}

function craftQueryPacket() {
    let packet = new Packet();
    packet.writeVarInt(0x00);
    packet.sign();
    return packet.get();
}