module.exports = {
	
	initializeModule: function(mod){

		//set name
		this.module = mod;

        //subscribe to bot events
		bot.subscribeEvent(this, 'ready');
		
	},

	onEvent: function(event, data){
		
		if(event == "ready"){

			//This is how to define command checks.
			//If false is returned to any of these checks, the command will not be executed.
			
			bot.addCommandCheck( function(message, cfg){	
				
				//Prevent selfbots from doing the not smart.
				if(bot.selfbot == true && message.author !== client.user){ return false; }
				return true;

			});	

			bot.addCommandCheck( function(message, cfg){
				
				// Check For Prefix
				return message.content.startsWith(cfg.discord.prefix)

			});

			bot.addCommandCheck( function(message, cfg){

				// Make sure the message is not from a bot.
				if ( message.author.bot ){ return false;  }
				return true;

			});
		}

	}

}