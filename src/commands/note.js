const Discord = require('discord.js');
const { Prefix, EmbedColor } = require('../config/config.json').Bot;

module.exports = {

    name: 'note',
    description: 'Add Notes To A Ticket',
    usage: `${Prefix}note <Ticket Number> <Note | Sub Command>`,

    async execute(bot, message, args, con) 
    {

    }
};