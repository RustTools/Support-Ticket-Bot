const Discord = require('discord.js');
const { Prefix, EmbedColor } = require('../config/config.json').Bot;
const { AnyoneCanAddNotes } = require('../config/config.json').Tickets;

module.exports = {

    name: 'note',
    description: 'Add Notes To A Ticket',
    usage: `${Prefix}note <Ticket Number> <Note | Sub Command>`,

    async execute(bot, message, args, con) 
    {
        try 
        {
            let TicketNumber = args[1];

            if (!TicketNumber || isNaN(TicketNumber)) return message.channel.send("Please provide a Ticket Number!");

            const [ TicketData ] = await con.execute(`SELECT * FROM Tickets WHERE TicketNumber = '${TicketNumber}';`);

            if (TicketData.length < 1) return message.channel.send("Invalid Ticket Number!");

            if (!(AnyoneCanAddNotes && TicketData[0].HandledBy === message.author.id)) return message.channel.send("You don't have permission to a note to this ticket!");
        } 
        
        catch (error) 
        {
            console.error(error);
    
            message.channel.send("There was an error adding a note to this ticket!");        
        }
    }
};