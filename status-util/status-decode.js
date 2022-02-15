/**
 * Decode the server status information to a query-compatible data map. Non-retrievable data will be a string of value 'undefined'.
 * The ``Map`` returned by this function is a 1:1 representation of the ``FullStat Map`` with the exception of containing the servers ``Icon`` encoded in base64 as its last element.
 * @param {*} host the host server object
 * @param {*} json the json status data
 * @returns FullStat-compatible `Map` of server data
 */
exports.decodeStatus = (host, json) => {
    var version = json?.version?.name;
    var serverType;
    
    var motd = getMotd(json);
    var players = tryGetPlayers(json?.players?.sample);

    if (version !== undefined) {
        let typeVersion = tryGetTypeVersion(version);
        if (typeVersion.length > 0) {
            serverType = typeVersion[0];
            version = typeVersion[1];
        }
    }

    return {
        motd: motd,
        type: 'SMP',
        gameid: 'MINECRAFT',
        version: version || 'undefined',
        plugins: 'undefined',
        servertype: serverType || 'undefined',
        playercount: json?.players?.online || 'undefined',
        maxplayers: json?.players?.max || 'undefined',
        port: host.port || 25565,
        players: players,
        icon: json?.favicon?.slice(22) || 'undefined'
    };
};

/**
 * Server MOTD is received in different formats depending on its formatting. This function decodes it to a simple ``String``.
 * @param {*} json the JSON response from the server
 * @returns an unformatted string representation of the server MOTD
 */
function getMotd(json) {
    if (json?.description?.extra !== undefined) {
        let motd = '';
        json.description.extra.forEach((item) => motd += item.text);
        return motd.trim();
    }
    else if (json?.description?.text != '' && json?.description?.text !== undefined) {
        return json.description.text.trim();
    }
    else {
        return '-'
    }
}

/**
 * This function tries to get the server type and version(s) from the `version` property of the status JSON response.
 * 
 * It operates under the axiom, that the general server software shows up by its name first, then followed by the version(s) supported.
 * Should determination fail, it will return an empty array, signalling to fall back to using placeholders.
 * @param {*} str version string
 * @returns  array where [0] is the server type and [1] is the (list of) version(s), empty array if no clear determination could be made.
 */
function tryGetTypeVersion(str) {
    let div = str.indexOf('1.');
    if (div == -1) return [];
    let data = [str.slice(0, div - 1).trim(), str.slice(div).trim()];
    if (data[0] != '' && data[1] != '') return data;
    return [];
}
 /**
  * Tries to convert the list of players into an array of player IGNs. Somehow has to use super hacky way in order to avoid undefined.
  * @param {*} players list of players as returned from the server
  */
function tryGetPlayers(players){
    if(players === undefined) return [];
    
    var strArray = [];
    players.forEach((item) => strArray.push(item.name));
    return strArray;
}