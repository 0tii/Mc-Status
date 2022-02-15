const { Buffer } = require('buffer');
/**
 * Wrapper for a ``Buffer`` object providing methods to craft ProtoBuf-like packets in accordance with the Server List Ping Protocol.
 * 
 * Create a new Packet either empty or from an existing stream
 * @example
 * //empty
 * let packet = new Packet();
 * //from stream
 * let packet = new Packet(stream);
 * @link https://wiki.vg/Server_List_Ping
 * 
 * © Daniel H. Rauhut (0ti)
 */
class Packet {
    constructor(stream = null) {
        if (stream == null)
            this.data = Buffer.alloc(0);
        else
            this.data = stream;
    }
    /**
     * Retrieve the modified packet
     * @returns the buffer representing the packet
     */
    get() {
        return this.data;
    }
    /**
     * Prepends the stream length as VarInt to the buffer, as required by the SLP protocol
     */
    sign() {
        let byteLength = this.data.byteLength;
        this.data = Buffer.concat([this._toVarIntBuffer(byteLength), this.data]);
    }
    /**
     * Write an integer as VarInt to the buffer
     * @param {*} int The integer value to write to the packet as VarInt
     */
    writeVarInt(int) {
        this.data = Buffer.concat([this.data, this._toVarIntBuffer(int)]);
    }
    /**
     * Write an integer as Short to the buffer
     * @param {*} int The integer to be written to the packet as Short
     */
    writeShort(int) {
        let short = Buffer.alloc(2);
        short.writeUInt16BE(int);
        this.data = Buffer.concat([this.data, short]);
    }
    /**
     * Write a string as Short to the buffer
     * @param {*} str The string to be written to the packet as a bytelength-prepended string
     */
    writeString(str) {
        let string = Buffer.from([str]);
        this.data = Buffer.concat([this.data, this._toVarIntBuffer(string.byteLength), string]);
    }
    /**
     * Read a VarInt from the beginning of the buffer
     * @returns integer representation of the VarInt 
     */
    readVarInt(){
        return this._readVarInt(this.data);
    }
    /**
     * Read a VarInt and its length from the beginning of the buffer
     * @returns [] of integers, where [0] is value and [1] is bytelength
     */
    readVarIntL(){
        return this._readVarIntL(this.data);
    }
    /**
     * Read a VarInt from a specific index in the buffer
     * @param {*} index the start index of the VarInt to read
     * @returns integer representation of the VarInt
     */
    readVarIntAt(index){
        let subset = this.data.slice(index);
        return this._readVarInt(subset);
    }
    /**
     * Read a VarInt and its length from a specific index in the buffer
     * @param {*} index the start index of the VarInt to read
     * @returns [] of integers, where [0] is value and [1] is bytelength
     */
    readVarIntLAt(index){
        let subset = this.data.slice(index);
        return this._readVarIntL(subset);
    }

    /**
    * Custom js implementation of int to varint
    * ? https://wiki.vg/Protocol#VarInt_and_VarLong
    * @param {*} integer integer
    * @returns Buffer of VarInt type
    */
    _toVarIntBuffer(value) {
        var varInt = Buffer.alloc(0);
        while (true) {
            if ((value & ~0x7F) <= 0) {
                varInt = this._writeByte(varInt, value);
                return varInt;
            }
            varInt = this._writeByte(varInt, (value & 0x7F) | 0x80);
            value >>>= 7;
        }
    }

    /**
     * Writes a byte to a specified buffer. Just a readability-wrapper for ``Buffer.concat()``.
     * @param {*} buffer the buffer to write to
     * @param {*} byte thr write to byte to the buffer
     * @returns the `buffer` parameter with the ``byte`` appended to it
     */
    _writeByte(buffer, byte) {
        return Buffer.concat([buffer, Buffer.from([byte])]);
    }

    /**
     * Read the value of a VarInt buffer
     * ? https://wiki.vg/Protocol#VarInt_and_VarLong
     * @param {*} buffer A Buffer where the first <= 5 bytes represent a VarInt
     * @returns the byte length of the VarInt as an integer
     */
    _readVarInt(buffer) {
        let value = 0;
        let length = 0;
        let currentByte;

        while (true) {
            currentByte = buffer[length];
            value |= (currentByte & 0x7F) << (length * 7);
            length += 1;
            if (length > 5) {
                throw new Error('VarInt exceeds allowed bounds.');
            }
            if ((currentByte & 0x80) != 0x80) break;
        }
        return value;
    }

    /**
     * Read the length of VarInt Buffer
     * @param {*} buffer A Buffer where the first <= 5 bytes represent a VarInt
     * @returns the byte length of the VarInt as an integer
     */
    _readVarIntLength(buffer) {
        //we basically have to read the whole value againin order to determine length
        let value = 0;
        let length = 0;
        let currentByte; //byte

        while (true) {
            currentByte = buffer[length];
            value |= (currentByte & 0x7F) << (length * 7);
            length += 1;
            if (length > 5) {
                throw new Error('VarInt exceeds allowed bounds.');
            }
            if ((currentByte & 0x80) != 0x80) break;
        }
        return length;
    }

    /**
     * Read the value and byte length of a ``VarInt`` buffer. Acts as a more efficient replacement for having to use both ``readVarInt()`` and ``readVarIntLength()`` since the latter effectively has to decode the ``VarInt`` a second time to return the length counter.
     * 
     * ? https://wiki.vg/Protocol#VarInt_and_VarLong
     * @param {*} buffer A Buffer where the first <= 5 bytes represent a ``VarInt``
     * @returns an ``Array`` of ``integers`` with the decoded ``VarInt`` at index 0 and the length at index 1.
     */
    _readVarIntL(buffer) {
        let value = 0;
        let length = 0;
        let currentByte; //byte

        while (true) {
            currentByte = buffer[length];
            value |= (currentByte & 0x7F) << (length * 7);
            length += 1;
            if (length > 5) {
                throw new Error('VarInt exceeds allowed bounds.');
            }
            if ((currentByte & 0x80) != 0x80) break;
        }
        return [value, length];
    }
}
module.exports = Packet;