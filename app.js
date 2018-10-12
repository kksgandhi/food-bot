/**
 * @author Moquo (Moritz Maier) and kksgandhi (Kutub Gandhi)
 */

const cheerio  = require('cheerio');
const request  = require('request');
const schedule = require('node-schedule');

// Get the configuration
const config = require('./config.json')

// discord.js library
const Discord = require('discord.js');

// Client
const client = new Discord.Client();

// On ready
client.on('ready', () => {
    console.log('Ready.');
});


// Login with bot token
client.login(config.token);

var url = 'http://dining.rice.edu/';
var j = schedule.scheduleJob('0 30 16 * * *', function(){
	request(url, function(error, response, html){
		var channel = client.channels.get(config.channel);
		if(!error){
			var $ = cheerio.load(html);

			var jsonData = {
				"North"   : [],
				"West"    : [],
				"Baker"   : [],
				"Seibel"  : [],
				"South"   : [],
				"SidRich" : []
			}
			
			// Iterates through every servery, where currServ is the actual name of the servery, not the ID
			for(var currServ in jsonData){
				var numItems = $('#' + currServ).parent().find('ul :not(:last-child) .menu-item').length
				
				// For each servery, use numItems to set array
				for (i = 0; i < numItems; i++){
					jsonData[currServ][i] = $('#' + currServ).parent().find('ul :not(:last-child) .menu-item').eq(i).text()
				}
			}
		}
		for(var servery in jsonData){
			var mealList = jsonData[servery];
			var fullMeal = "";
			for(var meal in mealList){
				fullMeal += mealList[meal] + "\n";
			}
			jsonData[servery] = "**"+servery+":**\n"+fullMeal;
		}
		channel.send(config.role_id);
		for(var servery in jsonData){
			if(jsonData[servery].length > 30){
				console.log(jsonData[servery]);
				channel.send(jsonData[servery])
					.then(msg => msg.react(config.react_emoji));
			}
		}
	});
});

client.on('message', (msg) => {
	//console.log(msg.channel)
});
