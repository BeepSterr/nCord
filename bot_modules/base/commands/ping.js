module.exports = {
    
    trigger: "ping",
    enabled: true,
    
    //module: "name", (this gets automatically set when its loaded, its only here for reference. This is used when you disable a module.)

    commandInitialization: function(){

        bot.addAlias(this, 'test');

    },

    triggerCommand: function (message, args, config){

        bot.log('triggered')
        message.channel.send("Pong! ( " + client.ping + "ms )");

    }


}