const { Token, Prefix, EmbedColor, Status } = require('./config/config.json').Bot;
const { SupportChannel, NewTicketsChannel, TicketMasters, AutorizedUsersRoles } = require('./config/config.json').Tickets;

const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

const { readdirSync } = require('fs');

let con = null;

const CommandFiles = readdirSync('./src/commands').filter(file => file.endsWith('.js'));

CommandFiles.forEach(CommandFile => {

    try 
    {
        const Command = require(`./commands/${CommandFile}`);

        bot.commands.set(Command.name, Command);
    
        console.log(`Loaded ${Command.name.charAt(0).toUpperCase() + Command.name.substring(1)}`);
    } 

    catch (err) { console.error(`Failed To Load A Command (${CommandFile})! ${err}`); }

});

bot.on("ready", async() => {

    con = await require('./database/connection').ConnectToDatabase();

    console.log(`${bot.user.username} is now online!`);
    
    bot.user.setActivity(Status.Text, { type: Status.Type });

    setInterval(() => { if (con != null) con.query("SELECT * FROM Tickets"); }, 1800000);

});

bot.on("message", async message => {

    if (message.author.bot || con == null) return;

    if (!message.guild)
    {
        if (message.content === `${Prefix}close`) bot.commands.get("close").execute(bot, message, con).catch(err => console.log(err));

        return;
    }

    if (message.channel.id === SupportChannel)
    {        
        try 
        {
            message.delete();
        
            const PossibleTicketStates = [ "Completed", "Denied", "Closed" ];
            
            const [ UserData ] = await con.execute(`SELECT * FROM Tickets WHERE CreatedBy = '${message.author.id}' ORDER BY TicketNumber DESC LIMIT 1;`);
    
            if (UserData.length < 1 || PossibleTicketStates.includes(UserData[0].Status))
            {
                const [ TicketData ] = await con.execute(`SELECT * FROM Tickets;`);
                
                const TicketNumber = TicketData.length + 1;
                const CreationDate = Math.round(+new Date()/1000);
    
                await con.execute(`INSERT INTO Tickets (TicketNumber, Status, CreatedBy, TicketText, HandledBy, OpenedOn, HandledOn, ClosedOn) VALUES ("${TicketNumber}", "Pending", "${message.author.id}", "${message.content}", NULL, "${CreationDate}", NULL, NULL);`);
                
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                
                const NewSupportTicket = new Discord.MessageEmbed()

                NewSupportTicket.setColor(EmbedColor)
                NewSupportTicket.setTitle("New Support Ticket - Number " + TicketNumber)
                NewSupportTicket.setDescription(message.content) 
                NewSupportTicket.addField("Creator", "```" + message.author.tag + "```", true)
                NewSupportTicket.addField("Opened On", "```" + GetDate(CreationDate) + "```", true)
                NewSupportTicket.setFooter(`Use ${Prefix}accept ${TicketNumber} to accept it!`)
                
                await bot.channels.cache.get(NewTicketsChannel).send(NewSupportTicket).catch();
                
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                
                const SupportTicketdDM = new Discord.MessageEmbed()
            
                SupportTicketdDM.setColor(EmbedColor)
                SupportTicketdDM.setTitle("Support Ticket")
                SupportTicketdDM.setDescription("Your support ticket has been received, a admin will accept it soon!\n\nYou can close this ticket by typing ``!close`` here at any time!")
                SupportTicketdDM.addField("Ticket Number", "```" + TicketNumber + "```")
                
                await message.author.send(SupportTicketdDM).catch();
            }
    
            else message.author.send("You already have a pending Ticket, you can close that ticket by typing ``!close`` here!");
        } 
        
        catch (error) { console.log("Failed To Create New Ticket! Error" + error); }

        return;
    }

    const MessageAuthorRoles = await message.guild.member(message.author)._roles;

    if (!(TicketMasters.includes(message.author.id) || AutorizedUsersRoles.includes(message.author.id) || AutorizedUsersRoles.some((Role) => MessageAuthorRoles.indexOf(Role) !== -1))) return;

    const args = message.content.slice(Prefix.length).split(/ +/g);
    const command = args[0].toLowerCase();

    if (!message.content.startsWith(Prefix) || !bot.commands.has(command) || command === "close") return;
    
    bot.commands.get(command).execute(bot, message, args, con).catch(err => console.log(err));

});

bot.login(Token).catch(console.error());

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