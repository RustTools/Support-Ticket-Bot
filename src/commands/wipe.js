const Discord = require('discord.js');
const { Prefix, EmbedColor } = require('../config/config.json').Bot;
const { TicketMasters } = require('../config/config.json').Tickets;

module.exports = {

	name: 'wipe',
	description: 'Wipes The Database',
    usage: `${Prefix}wipe`,

	async execute(bot, message, args, con) 
    {
        try 
        {
            if (!TicketMasters.includes(message.author.id)) return;

            const filter = m => m.author.id === message.author.id;
    
            message.channel.send("Are you sure you want to delete the tickets logs! Reply with **yes** to confirm in the next 30 seconds!");
    
            message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] }).then(async CollectedMessage => {
                
                if (!CollectedMessage.first().content === "yes") return message.channel.send("Canceled!");
    
                await con.execute('DROP TABLE Tickets;');
    
                require('../database/connection').CreateNewTable(con).catch(() => { return message.channel.send("Failed To Create New Table!"); });
                    
                message.channel.send("Database Reseted!");
            
            }).catch(() => message.channel.send("Canceled!"));
        } 
        
        catch (error) 
        {
            console.error(error);
    
            message.channel.send("There was an error reseting the database!");    
        }
    }
};