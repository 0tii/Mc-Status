# 🔎 Mc Server Status

Async node.js implementation of the UDP Minecraft Server Query Protocol and TCP Minecraft Server List Ping Protocol.

After using implementations that either were bloated with functionality not suitable for my use-case, required some boilerplate like class instantiation and manual socket closing or were just way too abstracted for the small task they provide, I decided to prep up my own - plain - implementation of the UDP Server Query Protocol, as lined out by Dinnerbone in his [Original Blog Post](https://dinnerbone.com/blog/2011/10/14/minecraft-19-has-rcon-and-query/), as well as the [Server List Ping Protocol](https://wiki.vg/Server_List_Ping)  in a ~~purely functional manner~~ (only up to v1.1.0). I just want to call a single function and that's it - so I did it.

# Requirements

The target minecraft server has to run the JAVA edition of minecraft on any version more recent than 1.7.

In order to use `Server Query Protocol` (`queryBasicStat()` and `queryFullStat()`) the `server.properties` file (or if a proxy like Bungeecord or Waterfall is used in their specific config file) the option `enable-query` has to be set to `true` and the `query.port` has to bet set to any valid port (can be the same as the game port but has to be specified) and the server must be running Java Edition.

In order to use `Server List Ping Protocol` (`serverStatus()`) the server must be online, running Java Edition and may not be behind an obfuscation proxy like TCPShield. It does **not** have to have `enable-query` enabled, however the retrievable data is limited in comparison to the ``Server Query Protocol``.

# How to use

No fancy instantiations or anything necessary, simply require the wanted function(s) from `mc-server-query` and/or `mc-server-status` and call the function you need, then you'll receive a `Map` of the server data (or an error).

```javascript
const { queryFullStat } = require('./mc-server-query');

(async function () {
    try {
        let info = await queryFullStat({ host: "localhost", port: 56789, timeout: 6000 });
        console.log(info);
    } catch (err) {
        console.log('FullStat Query threw an error:\n\n' + err);
    }
})();

```

```javascript
const { queryBasicStat } = require('./mc-server-query');

queryBasicStat({ host: "localhost", port: 56789, timeout: 6000 })
    .then((map)=>{
        console.log(map);
    })
    .catch((err) => console.log(err)); 

```

```javascript
const { serverStatus } = require('./mc-server-status');

serverStatus({ host: "localhost", port: 56789, timeout: 6000 })
    .then((map)=>{
        console.log(map);
    })
    .catch((err) => console.log(err)); 

```

# Arguments

All functions take an `Object` parameter consisting of the following attributes:

```
host: (string) Domain or IP-Address of the target server 
port: (integer) [optional] Query Port of the target server (default 25565)
timeout: (integer) [optional] Time in ms until the request should time out (default: 4000)
```

All query functions return a `Map` of the query data.

# Output

**Full stat**:

```
{
  motd: 'This is a MOTD',
  type: 'SMP',
  gameid: 'MINECRAFT',
  version: '1.x.x',
  plugins: 'Plugin1; Plugin2; Plugin3',
  servertype: 'world',
  playercount: '3',
  maxplayers: '100',
  port: '25565',
  players: [ 'EpicPlayer', '0ti', 'otto6' ]
}
```

**Basic Stat**:

```
{
  motd: 'This is a MOTD',
  type: 'SMP',
  servertype: 'world',
  playersonline: '3',
  maxplayers: '100'
}
```
**Server status** data may be limited depending on server software used, but is reliably mapped to the FullStat data map format and uses some internal functions in order to try and get as much readable data as possible. It has an additional field containing the base64 string representation of the favicon of the server, if exists:

```
{
  motd: 'This is a MOTD',
  type: 'SMP',
  gameid: 'MINECRAFT',
  version: '1.x.x',
  plugins: 'undefined',
  servertype: 'world',
  playercount: '3',
  maxplayers: '100',
  port: '25565',
  players: [ 'EpicPlayer', '0ti', 'otto6' ],
  favicon: *string, base64 encoded*
}
```

# Intended Use

Initially I wrote this small ibrary as a simple way to use the `Server Query Protocol`, however after learning how little servers even have query enabled in their config, I felt the need to add a fallback option. Therefore the intended use is to try and query server data using the `Server Query Protocol` and if the server does not allow query, use the `Server List Ping Protocol` function `serverStatus()` to force a server status response and acquire server data.

# Limitations

Some servers run behind a proxy aimed at protecting from DDOS, such as TCPShield. Many large playercount servers use such system. In that case neither protocols will result in retrievable data and the only way to get data from those servers is to get your request host whitelisted by those servers.

# Dependencies

This library is using `dgram` for UDP Messaging, `net` for TCP Messaging and `buffer` to craft the necessary packets. These are standard libraries included in the nodejs runtime and therefore this library does not require any external dependencies.