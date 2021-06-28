const Discord = require('discord.js');
const { Prefix, EmbedColor } = require('../config/config.json').Bot;

module.exports = {

	name: 'help',
	description: 'Shows All Commands',
    usage: `${Prefix}help`,

	async execute(bot, message, args, con) 
    {
        const HelpEmbed = new Discord.MessageEmbed();

        HelpEmbed.setColor(EmbedColor)
        HelpEmbed.setTitle("All Commands")

        bot.commands.forEach(command => HelpEmbed.addField(`${command.name.charAt(0).toUpperCase() + command.name.substring(1)} | ${command.description}`, "```" + command.usage + "```"));

        message.channel.send(HelpEmbed);
    }
};