const Discord = require('discord.js');
const { Prefix, EmbedColor } = require('../config/config.json').Bot;
const { FinishedTicketsChannel } = require('../config/config.json').Tickets;

module.exports = {

	name: 'completed',
	description: 'Sets A Ticket As Completed',
    usage: `${Prefix}completed <Ticket Number>`,

	async execute(bot, message, args, con) 
    {
        try 
        {
            let TicketNumber = args[1];

            if (!TicketNumber || isNaN(TicketNumber)) return message.channel.send("Please provide a Ticket Number!");

            const [ TicketData ] = await con.execute(`SELECT * FROM Tickets WHERE TicketNumber = '${TicketNumber}';`);

            if (TicketData.length < 1) return message.channel.send("Invalid Ticket Number!");

            if (!(TicketData[0].HandledBy === message.author.id && TicketData[0].Status === "Accepted")) return message.channel.send("Wrong Ticket Number!");
            
            const CurrentDate = Math.round(+new Date()/1000);

            await con.execute(`UPDATE Tickets SET Status = 'Completed', ClosedOn = '${CurrentDate}' WHERE TicketNumber = '${TicketNumber}';`);
        
            message.channel.send("The ticket was set as **completed**!")
            
            let TicketCreator = await bot.users.fetch(TicketData[0].CreatedBy);
                        
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            
            const SupportTicket = new Discord.MessageEmbed()

            SupportTicket.setColor(EmbedColor)
            SupportTicket.setTitle("Support Ticket - Number " + TicketData[0].TicketNumber)
            SupportTicket.setDescription(TicketData[0].TicketText)
            
            SupportTicket.addField("Status", "```Completed```", true)
            SupportTicket.addField("Creator", "```" + TicketCreator.tag + "```", true)
            SupportTicket.addField("Handled By",  "```" + message.author.tag + "```", true)

            SupportTicket.addField("Opened On", "```" + GetDate(TicketData[0].OpenedOn) + "```", true)
            SupportTicket.addField("Handled On", "```" + GetDate(TicketData[0].HandledOn) + "```", true)
            SupportTicket.addField("Closed On", "```" + GetDate(CurrentDate) + "```", true)
        
            bot.channels.cache.get(FinishedTicketsChannel).send(SupportTicket).catch();

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            const TicketUpdate = new Discord.MessageEmbed()
        
            TicketUpdate.setColor(EmbedColor)
            TicketUpdate.setTitle("Ticket Update")
            TicketUpdate.setDescription("Your ticket was set as **completed**, you can now create a new one!")
            TicketUpdate.addField("Ticket Number", "```" + TicketNumber + "```", true)

            TicketCreator.send(TicketUpdate).catch(() => message.channel.send("Failed to DM the ticket creator with the ticket update!"));
        } 
        
        catch (error) 
        {
            console.error(error);
    
            message.channel.send("There was an error setting the ticket as completed!");        
        }
    }
};

function GetDate(Timestamp) 
{
    if (Timestamp === null) return "No Information";

    var TicketDate = new Date(Timestamp * 1000);

    var Months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    
    var Day = TicketDate.getDate();
    var Month = Months[TicketDate.getMonth()];
    var Year = TicketDate.getFullYear();
    var Hour = TicketDate.getHours();
    var Min = TicketDate.getMinutes();

    return `${Day} ${Month} ${Year}, ${Hour}:${Min}`;
}