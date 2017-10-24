
// LOAD MODULES
try{
    
    //Discord.js Base
    Discord = require("discord.js");
    client = new Discord.Client();
    
    //all of the yes
    chalk = require('chalk');
    fs = require('fs');
    rvequest = require('request');
    mysql      = require('mysql');
    path = require('path')

    //temporary require
    blessed = require('blessed');
    contrib = require('blessed-contrib')

    //selfbot
    selfbot = false;

    cmds = {};
    modules = {};
    bot = {};
    bot.stats = { commands: 0 }
    bot.status = "Starting";

}catch(ex){
    
    console.error(ex);
    
    console.error('\x1b[31m' + 'FATAL ERROR:');
    console.error(' Cannot load required bot modules.');
    console.error(' Try running "npm install" and try again.\x1b[0m');
    process.exit();
}

try{
    
    var cfg = require('./config.json');
    
}catch(ex){
    
    console.error(chalk.red('FATAL ERROR:'));
    console.error(chalk.red(' Cannot load config.json'));
    process.exit();
    
}

bot.setStatus = function(text, stat) {
    status.log(text)
}
bot.log = function(text) {
    log.log(text)
}

bot.message = function(type, message){
    if(type == 'in'){ incmsg.log(message); }
}

//create layout and widgets
var screen = blessed.screen()
var grid = new contrib.grid({rows: 12, cols: 12, screen: screen})

var log = grid.set(10, 0, 2, 12, contrib.log, 
    { fg: "green"
    , selectedFg: "green"
    , label: 'Server Log'})

var status = grid.set(0, 0, 1, 12, contrib.log, 
    { fg: "green"
    , selectedFg: "green"
    , label: 'Bot Status'})

var incmsg = grid.set(1, 8, 4, 4, contrib.log, 
    { fg: "green"
    , selectedFg: "green"
    , label: 'Incomming Messages'})

var outmsg = grid.set(5, 8, 2, 4, contrib.log, 
    { fg: "green"
    , selectedFg: "green"
    , label: 'Outgoing Messages'})

    var socketlog = grid.set(7, 8, 3, 4, contrib.log, 
        { fg: "green"
        , selectedFg: "green"
        , label: 'WS log'})
    

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// fixes https://github.com/yaronn/blessed-contrib/issues/10
screen.on('resize', function() {
  log.emit('attach');
});

screen.render()

bot.setStatus('Starting bot...');

bot.getClient = function(){ return client }
bot.eventListeners = {}
bot.subscribeEvent = function(mod, event){
    if(bot.eventListeners[event] == undefined){
        bot.eventListeners[event] = [];
    }

    bot.eventListeners[event].push(mod.module);

};

bot.onEvent = function(event, data){

    if(bot.eventListeners[event] == undefined){
        bot.eventListeners[event] = [];
    }

    bot.eventListeners[event].forEach(listener =>{
        modules[listener].onEvent(event, data);
    })

};

bot.reply = function(message, content, embed = {}){ message.channel.send(content, embed); outmsg.log(content); }

// Config & Node-Modules loaded
// Lets start identifying bot modules.
var botModules = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory()) //thx @pravdomil
var modulesInit = botModules(__dirname + '/bot_modules/');

modulesInit.forEach(mod =>{

    bot.log('Loading Module: ' + mod);

    //module 'mod' is about to be loaded.
    modules[mod] = require(__dirname + '/bot_modules/' + mod + '/module.js');
    modules[mod].initializeModule(mod);

    //now lets get the commands from said module
    fs.readdir(__dirname + '/bot_modules/' + mod + '/commands/', (err, files) => {
        files.forEach(file => {
            try{

                bot.log('Loading Command: ' + file);

                temp = require(__dirname + '/bot_modules/' + mod + '/commands/' + file);
                cmds[temp.name] = temp
                cmds[temp.name].commandInitialization();
      
            }catch(ex){
                bot.log(chalk.red('Loading Module ' + mod + " failed: ") + ex);
            }
        });
    })

})

// EVENT DECLARATION
client.on('message',                            evnt            => { bot.onEvent('message', evnt);});

client.on('channelCreate',                      evnt            => { bot.onEvent('channelCreate', evnt);});
client.on('channelDelete',                      evnt            => { bot.onEvent('channelDelete', evnt);});``
client.on('channelPinsUpdate',                  (evnt, time)    => { bot.onEvent('channelPinsUpdate', {evnt, time});});
client.on('channelUpdate',                      (evnt, old)     => { bot.onEvent('channelUpdate', {evnt, old});});

client.on('clientUserGuildSettingsUpdate',      evnt            => { bot.onEvent('clientUserGuildSettingsUpdate', evnt);});
client.on('clientUserSettingsUpdate',           evnt            => { bot.onEvent('clientUserSettingsUpdate', evnt);});

client.on('emojiCreate',                        evnt            => { bot.onEvent('emojiCreate', evnt);});
client.on('emojiDelete',                        evnt            => { bot.onEvent('emojiDelete', evnt);});
client.on('emojiUpdate',                        evnt            => { bot.onEvent('emojiUpdate', evnt);});

client.on('error',                              evnt            => { bot.onEvent('error', evnt);});
client.on('disconnect',                         evnt            => { bot.onEvent('disconnect', evnt);});
client.on('ready',                              ()              => { bot.onEvent('ready', null); });

//debug info
client.on('debug', info => {
    if(cfg.debug == true){
        socketlog.log(info);
    }
});

//command processing
client.on('message', message => {
    
    //Prevent selfbots from doing stupid shit.
    if(selfbot == true && message.author !== client.user) return;
    
    //Prefixpls
    if (!message.content.startsWith(cfg.defaults.prefix) || message.author.bot) return;
    
        var messageC = message.content.substring(cfg.defaults.prefix.length, message.content.length);
        args =  messageC.split(/ +(?=(?:(?:[^"]*"){2})*[^"]*$)/g);
    
        if(typeof cmds[args[0]] == 'object'){
            cmds[args[0]].triggerCommand(message, args);
            log.log('Executed command ' + args[0]);
            bot.stats.commands++;
        }
    
});

client.login(cfg.auth.token);