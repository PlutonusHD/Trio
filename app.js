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