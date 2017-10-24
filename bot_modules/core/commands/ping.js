module.exports = {

    name: "ping",

    commandInitialization: function(){


    },

    triggerCommand: function (message, args){

        bot.log('Ping received');
        bot.reply(message, 'Pong!');


    }


}