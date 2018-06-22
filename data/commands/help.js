module.exports = {
    name: 'help',
    description: 'List all of my commands or info about a specific command.',
    usage: '[command name]',
    cooldown: 5,
    execute(c, msg, args) {
		const { commands } = msg.client;
		const { prefix } = require('../config');
		let out='';
		let out2='';

		if (!args.length) {
			out+=commands.map(command => command.name).join('\n');
			out2+=commands.map(command => command.description).join('\n');

			return msg.channel.send({"embed":{"title":"Commands", "fields":[{"name":"Command","value":out,"inline":true},{"name":"Description","value":out2,"inline":true}]}})
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return msg.reply('that\'s not a valid command!');
		}

		out+=`**Command:** ${command.name}\n`
		
		if (command.description) out+=`**Description:** ${command.description}\n`;
		if (command.usage) out+=`**Usage:** ${prefix}${command.name} ${command.usage}\n`;

		msg.channel.send({"embed":{"title": "Command Info", "description": out}});
	},
};