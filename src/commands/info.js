const Discord = require('discord.js');
const { Prefix, EmbedColor } = require('../config/config.json').Bot;

module.exports = {

	name: 'info',
	description: 'Shows Information About A Ticket',
    usage: `${Prefix}info <Ticket Number>`,

	async execute(bot, message, args, con) 
    {
        try
        {
            let TicketNumber = args[1];

            if (!TicketNumber || isNaN(TicketNumber)) return message.channel.send("Please provide a Ticket Number!");

            const [ TicketData ] = await con.query(`SELECT * FROM Tickets WHERE TicketNumber = '${TicketNumber}';`);

            if (TicketData.length < 1) return message.channel.send("Invalid Ticket Number!");
            
            let TicketStatus =  TicketData[0].Status === "Closed" ? "Closed By Creator" : TicketData[0].Status;
            let TicketCreator = await (await bot.users.fetch(TicketData[0].CreatedBy)).tag;
            let TicketHandler = TicketData[0].HandledBy == null ? "No Information" : await (await bot.users.fetch(TicketData[0].HandledBy)).tag;

            const SupportTicket = new Discord.MessageEmbed()
            
            SupportTicket.setColor(EmbedColor)
            SupportTicket.setTitle("Support Ticket - Number " + TicketData[0].TicketNumber)
            SupportTicket.setDescription(TicketData[0].TicketText)
            
            SupportTicket.addField("Status", "```" + TicketStatus + "```", true)
            SupportTicket.addField("Creator", "```" + TicketCreator + "```", true)
            SupportTicket.addField("Handled By",  "```" + TicketHandler + "```", true)

            SupportTicket.addField("Opened On", "```" + GetDate(TicketData[0].OpenedOn) + "```", true)
            SupportTicket.addField("Handled On", "```" + GetDate(TicketData[0].HandledOn) + "```", true)
            SupportTicket.addField("Closed On", "```" + GetDate(TicketData[0].ClosedOn) + "```", true)

            message.channel.send(SupportTicket);        
        } 
        
        catch (error) 
        {
            console.error(error);
    
            message.channel.send("There was an error fetching/handling the ticket information!");          
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