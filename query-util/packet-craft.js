/**
 * @returns the handshake packet that signals the target host to dispatch a challenge token
 */
exports.craftHandshakePacket = function craftHandshakePacket() {
    return Buffer.from(
        [
            0xFE, 0xFD, //Magic Bytes
            0x09, //Request Type Handshake
            0x00, 0x74, 0x69, 0x69 //random 4 byte id token (so why not '0tii' lol)
        ]
    );
}
/**
 * @returns the packet for a full stat query sans challenge token
 */
exports.craftFullStatPacket = function craftFullStatPacket() {
    let packet = Buffer.alloc(15);
    packet.writeUInt16BE(0xFEFD, 0); //Magic Bytes
    packet.writeUInt8(0x00, 2); //Request Type 'Query'
    packet.writeInt32BE(0x00746969, 3); //ID (0tii)
    //challenge token
    packet.writeInt32BE(0x00746969, 11); //ID again to query full stat
    return packet;
}
/**
 * @returns the packet for a basic stat query sans challenge token
 */
exports.craftBasicStatPacket = function craftBasicStatPacket() {
    let packet = Buffer.alloc(11);
    packet.writeUInt16BE(0xFEFD, 0); //Magic Bytes
    packet.writeUInt8(0x00, 2); //Request Type 'Query'
    packet.writeInt32BE(0x00746969, 3); //ID (0tii)
    //challenge token
    return packet;
}