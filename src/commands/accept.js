const Discord = require('discord.js');
const { Prefix, EmbedColor } = require('../config/config.json').Bot;
const { NewTicketsChannel, OneActiveTicket } = require('../config/config.json').Tickets;

module.exports = {

	name: 'accept',
	description: 'Accepts A Support Ticket',
    usage: `${Prefix}accept <Ticket Number>`,

	async execute(bot, message, args, con) 
    {
        try 
        {
            let TicketNumber = args[1];

            if (!TicketNumber || isNaN(TicketNumber)) return message.channel.send("Please provide a Ticket Number!");

            const [ TicketData ] = await con.execute(`SELECT * FROM Tickets WHERE TicketNumber = '${TicketNumber}';`);

            if (TicketData.length < 1) return message.channel.send("Invalid Ticket Number!");

            if (TicketData[0].Status != "Pending") return message.channel.send("That Ticket was already Accepted/Denied!");

            if (OneActiveTicket)
            {
                const [ UserData ] = await con.execute(`SELECT * FROM Tickets WHERE HandledBy = '${message.author.id}' ORDER BY TicketNumber DESC LIMIT 1;`);
                
                if (UserData.length > 0 && UserData[0].Status === "Accepted") return message.channel.send(`You cannot accepted a Ticket while having a pending one! (Ticket Number -> ${UserData[0].TicketNumber})`);
            }

            await con.execute(`UPDATE Tickets SET Status = 'Accepted', HandledBy = '${message.author.id}', HandledOn = '${Math.round(+new Date()/1000)}' WHERE TicketNumber = '${TicketNumber}';`);
        
            message.channel.send("You have accepted the ticket, a copy of it has been sent to your DMs!");

            let TicketCreator = await bot.users.fetch(TicketData[0].CreatedBy);

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            const SupportTicket = new Discord.MessageEmbed()

            SupportTicket.setColor(EmbedColor)
            SupportTicket.setTitle("Support Ticket - Number " + TicketNumber)
            SupportTicket.setDescription(TicketData[0].TicketText) 
            SupportTicket.addField("Creator", "```" + TicketCreator.tag + "```", true)
            SupportTicket.addField("Opened On", "```" + GetDate(TicketData[0].OpenedOn) + "```", true)

            message.author.send(SupportTicket).catch(() => message.channel.send("Failed to DM you a copy of the ticket!"));

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            const TicketUpdate = new Discord.MessageEmbed()

            TicketUpdate.setColor(EmbedColor)
            TicketUpdate.setTitle("Ticket Update")
            TicketUpdate.setDescription("Your Ticket was been accepted!")
            TicketUpdate.addField("Ticket Handler", "```" + message.author.tag + "```", true)   
            TicketUpdate.addField("Ticket Number", "```" + TicketNumber + "```", true)   

            TicketCreator.send(TicketUpdate).catch(() => message.channel.send("Failed to DM the ticket creator with the ticket update!"));

            try 
            {
                const FetchedMessages = await bot.channels.cache.get(NewTicketsChannel).messages.fetch();
                
                const MessagesToDelete = await FetchedMessages.filter(msg => msg.embeds.length != 0 && msg.embeds[0].title.includes(TicketNumber.toString()));

                bot.channels.cache.get(NewTicketsChannel).bulkDelete(MessagesToDelete, true);
            } 
            
            catch (error) { message.channel.send("Failed to find or delete the ticket on the ticket queue!"); }
        } 
        
        catch (error) 
        {
            console.error(error);
    
            message.channel.send("There was an error accepting the ticket!");        
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