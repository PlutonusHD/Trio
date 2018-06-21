try {
    require.resolve("discord.js");
    require.resolve("chalk");
    require.resolve("sqlite");
} catch(e) {
    console.log(e);
    console.log("Please do 'npm install' inside of this folder.")
    process.exit(1);
}

const trio=new(require("discord.js")).Client();
const { token, prefix } = require("./data/config");
const chalk = require("chalk");
const sql = require("sqlite");
sql.open("./data/global.sqlite").then(() => {
    //sql.run("");
});

console.log(chalk.black.bgGreen("Trio") + ": Starting...");
if(!token) {
    console.log("\n" + chalk.bgRed("Err") + ": The config file is missing a bot token.");
    console.log(chalk.bgRed("Err") + ": Edit the '/data/config.js' file")
    process.exit(1);
}
console.log(chalk.black.bgGreen("Trio") + ": Connecting to Discord API...");
trio.login(token);

trio.on('ready', () => {
    if(!trio.user.bot) {
        console.log(chalk.bgRed("Err") + ": " + chalk.red("Trio is not designed to run under a Discord user account!"));
        process.exit(1);
    }
    console.log(chalk.bgGreen("Trio") + ": Registering commands...");
    trio.commands = new Discord.Collection();
    trio.cooldown = new Discord.Collection();
    const cmds = fs.readdirSync('./data/commands').filter(file => file.endsWith('.js'));
    let i=0;
    for (const f of cmds) {
        const cmd = require(`./data/commands/${f}`);
        c.commands.set(cmd.name, cmd);
        i++;
        console.log(chalk.bgGreen("Trio") + `: Registed command '${cmd.name}'`);
    }
    console.log(chalk.bgGreen("Trio") + `: Registered a total of ${i} commands.`);

    // Once complete, do:
    trio.on('message', msg => {
        if (!msg.content.startsWith(prefix) || msg.author.bot) return;
        const args = msg.content.slice(prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        if (!trio.commands.has(commandName)) return;
        const command = trio.commands.get(commandName);
        
        if (!trio.cooldown.has(command.name)) {
            trio.cooldown.set(command.name, new Discord.Collection());
        }

        const now = Date.now();
        const timestamps = trio.cooldown.get(command.name);
        const cooldownAmount = (command.cooldown * 1000) || 0;

        if (!timestamps.has(msg.author.id)) {
            timestamps.set(msg.author.id, now);
            setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
        } else {
            const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;
    
            if (now < expirationTime) {
                let timeLeft = (expirationTime - now) / 1000;
                return msg.channel.send({"embed":{"title":"Command Timeout","description":"Please wait "+timeLeft.toFixed(1)+" more second(s) before reusing the `"+command.name+"` command."}});
            }
    
            timestamps.set(msg.author.id, now);
            setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
        }

        try {
            command.execute(trio, msg, args);
        }
        catch (error) {
            console.error(error);
            msg.reply("something went wrong while trying to execute that command!");
        }
    });
});

trio.on('disconnect', event => {
    if (event.code === 1000) {
        console.log(chalk.black.bgGreen.dim("PlutoBOT") + ": " + chalk.green("Disconnected from Discord."));
    } else if (event.code === 4004) {
        console.log(chalk.bgRed("Err") + ": " + chalk.red("The token you entered in the config is invalid!"));
        console.log(chalk.bgRed("Err") + ": Edit the '/data/config.js' file.");
        process.exit(1);
    } else {
        console.log(chalk.bgRed("Err") + ": " + chalk.red("Disconnected from Discord with code " + event.code));
    }
});