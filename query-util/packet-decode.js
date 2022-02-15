exports.decodeFullStatPacket = function decodeFullStatPacket(msg){
    let data = msg.toString('utf-8', 11).split('\0\0\x01player_\0\0');
    let info = data[0].split('\0');
    let players = data[1].split('\0').slice(0, -2);
    let map = {
        motd: info[3].replace(/�.{1}/g, '').trim(),
        type: info[5],
        gameid: info[7],
        version: info[9],
        plugins: info[11],
        servertype: info[13],
        playercount: info[15],
        maxplayers: info[17],
        port: info[19],
        players: players
    };
    return map;
}

exports.decodeBasicStatPacket = function decodeBasicStatPacket(msg){
    let data = msg.toString().split('\0'); 
    let map = {
        motd: data[2].substring(3).replace(/�.{1}/g, '').trim(),
        type: data[3],
        servertype: data[4],
        playersonline: data[5],
        maxplayers: data[6]
    };
    return map;
}