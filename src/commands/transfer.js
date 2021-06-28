const Discord = require('discord.js');
const { Prefix, EmbedColor } = require('../config/config.json').Bot;
const { NewTicketsChannel, FinishedTicketsChannel, TicketMasters, AutorizedUsersRoles } = require('../config/config.json').Tickets;

module.exports = {

	name: 'transfer',
	description: 'Transfers A Ticket From An Admin To Another',
    usage: `${Prefix}transfer <Ticket Number> <Admin Mention>`,

	async execute(bot, message, args, con) 
    {
        try 
        {
            let TicketNumber = args[1], MentionedAdmin = message.mentions.users.first();

            if (!TicketNumber || isNaN(TicketNumber)) return message.channel.send("Please provide a Ticket Number!");
    
            if (!MentionedAdmin) return message.channel.send("Please mention a Admin!");

            const MentionedAdminRoles = await message.guild.member(MentionedAdmin)._roles;

            console.log(MentionedAdminRoles)

            if (!(TicketMasters.includes(MentionedAdmin.id) || AutorizedUsersRoles.includes(MentionedAdmin.id) || AutorizedUsersRoles.some((Role) => MentionedAdminRoles.indexOf(Role) !== -1))) return message.channel.send("That user is **Not Autorized**!");;

            const [ TicketData ] = await con.query(`SELECT * FROM Tickets WHERE TicketNumber = '${TicketNumber}';`);
            const [ UserData ] = await con.query(`SELECT * FROM Tickets WHERE HandledBy = '${MentionedAdmin.id}' ORDER BY TicketNumber DESC LIMIT 1;`);

            if (TicketData.length < 1) return message.channel.send("Invalid Ticket Number!");
            
            if (!(TicketData[0].HandledBy === message.author.id && TicketData[0].Status === "Accepted")) return message.channel.send("Wrong Ticket Number!");
            
            if (!(UserData.length < 1 || TicketData[0].Status !== "Accepted")) return message.channel.send("That Admin has a pending Ticket!");

            let TicketCreator = await bot.users.fetch(`${TicketData[0].CreatedBy}`);
            let NewTicketHandler = await bot.users.fetch(`${MentionedAdmin.id}`);

            await con.execute(`UPDATE Tickets SET HandledBy = '${MentionedAdmin.id}' WHERE TicketNumber = '${TicketNumber}';`);

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            
            const TicketUpdate = new Discord.MessageEmbed()
    
            TicketUpdate.setColor("#0099ff")
            TicketUpdate.setTitle("Ticket Update")
            TicketUpdate.setDescription("Your ")
            TicketUpdate.addField("Ticket Number", "```" + TicketNumber + "```")
            TicketUpdate.addField("New Ticket Handler", "```" + NewTicketHandler.tag + "```", true)
            TicketUpdate.addField("Old Ticket Handler", "```" + message.author.tag + "```", true)

            TicketCreator.send(TicketUpdate).catch(() => message.channel.send("Failed to DM the ticket creator with the ticket update!"));
            
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            
            const SupportTicket = new Discord.MessageEmbed()

            SupportTicket.setColor(EmbedColor)
            SupportTicket.setTitle("Support Ticket - Number " + TicketNumber)
            SupportTicket.setDescription(TicketData[0].TicketText) 
            SupportTicket.addField("Creator", "```" + TicketCreator.tag + "```", true)
            SupportTicket.addField("Opened On", "```" + GetDate(TicketData[0].OpenedOn) + "```", true)

            NewTicketHandler.send(SupportTicket).catch(() => message.channel.send("Failed to DM the new handler a copy of the ticket!"));
        } 
        
        catch (error) 
        {
            console.error(error);
    
            message.channel.send("There was an error transfering the ticket!");       
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