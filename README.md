# Support Ticket Bot

A Simple To Use Support Ticket Bot

This isn't the final bot version and it's a **beta version**, so except for bugs, as I still want to implement a lot of more features, please check #Roadmap for more information!

For any help/support, join the [Discord Support Server](https://rusttools.xyz/support)!

## How It Works

Every message sent on the designated support channel will be deleted and sent to the ticket queue, a user can only have 1 active ticket at a given time, the same thing can be set for admin if that option is enabled. From there, admins can accept or deny it, everytime the ticket status has changed (accepted, denied, completed, transferred) the user gets a DM with that update. At any given time the user can close the ticket!

### Possible States Of A Ticket

* Pending
* Accepted
* Completed
* Denied

## Requirements/Dependencies

* Server/Bot Container with NodeJS 12 And MySQL
* A MySQL Database

## Setup 

Video Instruction: `Coming Soon`

### Setting Up The Database

With a lot of different OS's it's hard to explain here how to set up a MySQL database for each one of them, so please visit the [MySQL Installation Guide](https://dev.mysql.com/doc/mysql-installation-excerpt/5.7/en/) for detailed information on how to setup/install MySQL.

There's no need to set up tables, as their check and created, if needed, every time the bot connects to the database.

### Creating A Discord Bot

1. Visit The [Discord Dev Portal](https://discord.com/developers/applications) 

2. Click On `New Application`

3. Once Inside The Application Page, Visit The Bot Tab   And Click `Add Bot`

4. Click On `Copy` On The `Token` Area (This Will Be Needed For The Next Step)

#### Inviting The Discord Bot

1. Go To The Application Main Page

2. Copy The Application ID

3. Replace The ``ApplicationID`` From The Link Below For What You Just Copied

4. Follow The On-Screen Instructions

``https://discord.com/oauth2/authorize?client_id=ApplicationID&scope=bot&permissions=2684873792``

*Note: Some of the permissions are not needed but might be required for a future update!*

### Config File

An example of the config file can be found at `/src/config/example-config.json`.

### Hosting The Bot

A full detailed explanation will be here soon!

## Available Commands

* Help (Shows All Commands And How To Use Them)
* Accept
* Deny
* Completed
* Transfer
* Info
* Wipe

### Creating Custom Commands

Want to make your custom command? Just follow the basic format below and put the `.js` file under `/src/commands`!

```js 
const Discord = require('discord.js');
const { Prefix, EmbedColor } = require('../config/config.json').Bot;

module.exports = {

    name: '',
    description: '',
    usage: `${Prefix}`,

    async execute(bot, message, args, con) 
    {

    }
};
```

For any help/support, join the [Discord Support Server](https://rusttools.xyz/support)!

## Roadmap

* Stats Command
* Add Logs
* Move The Authorized Users To The Database
* Allow To Put Tickets In Stand By
* Add The Possibility To Add Notes To The Tickets
* Better Error Handling
* Option To Change Dates Timezone (UTC Currently)
* Custom Messages