const Discord = require('discord.js');
const { Prefix, EmbedColor } = require('../config/config.json').Bot;
const { NewTicketsChannel, FinishedTicketsChannel } = require('../config/config.json').Tickets;

module.exports = {

	name: 'close',
	description: 'Closes Ticket (Ticket Creator)',
    usage: `${Prefix}close <Ticket Number>`,

	async execute(bot, message, con) 
    {
        try 
        {
            const TicketIgnoreStates = [ "Completed", "Denied", "Closed" ];

            const [ UserTicketData ] = await con.execute(`SELECT * FROM Tickets WHERE CreatedBy = '${message.author.id}' ORDER BY TicketNumber DESC;`);

            if (UserTicketData.length < 1 || TicketIgnoreStates.includes(UserTicketData[0].Status)) return message.channel.send("You currently don't have a pending Ticket!");

            const CurrentDate = Math.round(+new Date()/1000);
            
            await con.execute(`UPDATE Tickets SET Status = 'Closed', ClosedOn = '${CurrentDate}' WHERE TicketNumber = '${UserTicketData[0].TicketNumber}';`);

            let TicketHandler, HandledOnDate;

            if (UserTicketData[0].HandledBy == null)
            {
                TicketHandler = "No Information";
                HandledOnDate = CurrentDate;

                await con.execute(`UPDATE Tickets SET HandledOn = '${CurrentDate}' WHERE TicketNumber = '${UserTicketData[0].TicketNumber}';`);

                try 
                {
                    const FetchedMessages = await bot.channels.cache.get(NewTicketsChannel).messages.fetch();
                
                    const MessagesToDelete = await FetchedMessages.filter(msg => msg.embeds.length != 0 && msg.embeds[0].title.includes(UserTicketData[0].TicketNumber.toString()));
    
                    bot.channels.cache.get(NewTicketsChannel).bulkDelete(MessagesToDelete, true);
                } 
                
                catch (error) { console.error(error); }
            }

            else 
            {
                let TicketHandlerUser = await bot.users.fetch(UserTicketData[0].HandledBy);
                
                TicketHandler = TicketHandlerUser.tag;
                HandledOnDate = UserTicketData[0].HandledOn;

                const ClosedSupportTicket = new Discord.MessageEmbed()

                ClosedSupportTicket.setColor(EmbedColor)
                ClosedSupportTicket.setTitle("Support Ticket Closed")
                ClosedSupportTicket.setDescription("A ticket that you were currently working on has been closed by his creator!")
                ClosedSupportTicket.addField("Ticket Number", "```" + UserTicketData[0].TicketNumber + "```", true)
                ClosedSupportTicket.addField("Ticket Creator", "```" + message.author.tag + "```", true)

                TicketHandlerUser.send(ClosedSupportTicket);
            }

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            
            const SupportTicket = new Discord.MessageEmbed()

            SupportTicket.setColor(EmbedColor)
            SupportTicket.setTitle("Support Ticket - Number " + UserTicketData[0].TicketNumber)
            SupportTicket.setDescription(UserTicketData[0].TicketText)
            
            SupportTicket.addField("Status", "```Closed By Creator```", true)
            SupportTicket.addField("Creator", "```" + message.author.tag + "```", true)
            SupportTicket.addField("Handled By",  "```" + TicketHandler + "```", true)

            SupportTicket.addField("Opened On", "```" + GetDate(UserTicketData[0].OpenedOn) + "```", true)
            SupportTicket.addField("Handled On", "```" + GetDate(HandledOnDate) + "```", true)
            SupportTicket.addField("Closed On", "```" + GetDate(CurrentDate) + "```", true)
        
            bot.channels.cache.get(FinishedTicketsChannel).send(SupportTicket).catch(err => console.error(err));

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            const TicketUpdate = new Discord.MessageEmbed()

            TicketUpdate.setColor(EmbedColor)
            TicketUpdate.setTitle("Ticket Update")
            TicketUpdate.setDescription("Your Ticket has been **closed**, you can now create a new one!")
            TicketUpdate.addField("Ticket Number", "```" + UserTicketData[0].TicketNumber + "```", true)

            message.channel.send(TicketUpdate).catch();
        } 
        
        catch (error) 
        {
            console.error(error);
    
            message.channel.send("There was an error closing the ticket!");        
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