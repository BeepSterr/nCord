module.exports = {
	
	initializeModule: function(mod){

		//set name
		this.module = mod;

        //subscribe to bot events
        bot.subscribeEvent(this, 'ready');
		bot.subscribeEvent(this, 'message');
		

	},

	onEvent: function(event, data){

		//this is where registered events will be received
        if(event == 'ready'){
			bot.setStatus("Logged in as " + client.user.tag, true);
			bot.log("Logged in as " + client.user.tag);
		}
		
		if(event == 'message'){
			if(data.author == client.user){
				bot.message('out', data.cleanContent);
			}else{
				bot.message('in', data.cleanContent);
			}
			
		}

	}
	
}