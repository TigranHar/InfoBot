//#region imports

const file = require('./account_info.json');

const commands_impl = require('./commands.json');

let file_path = './account_info.json';

const fs = require('fs');

const { Client, Intents } = require('discord.js');

const _client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

const { MessageEmbed } = require('discord.js');

const Reddit = require('snoowrap');

const { CommentStream } = require('snoostorm');

const { config } = require('dotenv');
const { url } = require('inspector');

config();

//#endregion imports

//#region _functions

function log_with_time(message) {
    console.log(String("[" + new Date()).substring(0,25) + "] " + message);
}

//#endregion _functions

//#region discord_misc

const _prefix = process.env._prefix;
const _token = process.env.discord_token;
const _username = process.env.username;
const _password = process.env.password;
const app_secret = process.env.app_secret;
const app_id = process.env.app_id;
const refresh_token = process.env.refresh_token;
const access_token = process.env.access_token;

//#endregion discord_misc

_client.on('ready', () => {
    log_with_time(`Logged in as ${_client.user.tag}`);
    _client.user.setActivity(_prefix + 'help', {
        type: 'PLAYING'
    });
});

const reddit = new Reddit({
    clientId: app_id,
    clientSecret: app_secret,
    userAgent: 'InfoBot 1.0.0 by /u/GoBrrrrrrrr',
    refreshToken: refresh_token,
    accessToken: access_token
});


_client.on('messageCreate', message => {
    let _args = message.content.substring(_prefix.length).split(' ');

    function erase() {
        fs.truncate(file_path, 0, () => {log_with_time("Truncated file!")});
    }

    function defaultFunc() {
        try {
            const embed = new MessageEmbed();
            embed.color = "0x00ff00";
            embed.setTitle(`${_args[1]}'s content posts`);
    
            if(parseInt(_args[2]) >= 24) return message.channel.send("Warning: Can't access more than 24!");
    
            if(file.length > 0) {              
                for(let i = 0; i < _args[2]; i++) {
                    if(file[i].subreddit_name_prefixed === null || file[i].subreddit_name_prefixed === undefined || file[i].permalink === undefined || file[i].permalink === null) {
                        return embed.addField(`Post ${i + 1}:`, 'Post not found!');
                    }
    
                    embed.addField(`Post ${i + 1} (from ${file[i].subreddit_name_prefixed}):`, `https://reddit.com${file[i].permalink}`);
                } 
            }
    
            message.channel.send({embeds: [embed]});
        } catch(err) {
            log_with_time(err);
            message.channel.send("Something went wrong!");
        }
    }

    switch (_args[0]) { 

        case "help":

            try {
                const help_embed = new MessageEmbed();

                help_embed.setColor('#0099ff');
                help_embed.setTitle('Instagram account booster');
                help_embed.addFields(
                    { name: '\u200B', value: '\u200B' },
                    { name: '**Commands**', value: '**↓**', inline: true },
                    { name: 'Prefix', value: '``.``', inline: true },
                )
                help_embed.setTimestamp(new Date());
                help_embed.setFooter({text: "Deliverd on ", iconURL: _client.user.avatarURL()})

                let i = 0

                commands_impl.commands.forEach(() => {
                    help_embed.addField(commands_impl.commands[i].command, commands_impl.commands[i].description);
                    i++;
                })  

                message.channel.send({embeds: [help_embed]});

            } catch(err) {
                log_with_time(err);
                message.channel.send("Something went wrong")
            }

        break;

        case 'comments':

            if(!_args[1]) return message.channel.send("You need to specify a username!");
            if(!_args[2]) return message.channel.send("You need to specify a number of comments!");

            (async function start() {
                try {
                    let comments = JSON.stringify(await reddit.getUser(_args[1]).getComments({limit: parseInt(_args[2])}));
                    let result = `${comments.substring(comments.length - 1, 0)}]`;
                    let message_to_send = JSON.parse(String(result.replace('\"md', '\"md')));
    
                    const embed = new MessageEmbed();
                    embed.color = "0x00ff00";
                    embed.setTitle(`${_args[1]}'s comments`);
    
                    for(let i = 0; i < message_to_send.length; i++) {
                        if(message_to_send[i].body.length < 1024) {
                            embed.addField(`Comment ${i + 1} from subreddit r/${message_to_send[i].subreddit}:`, `${message_to_send[i].body}`);
                        } 
                    }
    
                    message.channel.send({embeds: [embed]});
                } catch (err) {
                    log_with_time(err);
                    message.channel.send("Something went wrong!");
                }

            })();
        break;

        case 'saved':

            if(!_args[1]) return message.channel.send("You need to specify a username!");
            if(!_args[2]) return message.channel.send("You need to specify a number of posts!");

            (async function start() {
                try{

                    if(parseInt(_args[2]) > 24) return message.channel.send("Warning: Can't access more than 24!");

                    let content = JSON.stringify(await reddit.getUser(_args[1]).getSavedContent({limit: parseInt(_args[2])}));

                    fs.truncate(file_path, 0, () => {log_with_time("Truncated file!")});

                    fs.writeFile(file_path, content, () => {defaultFunc(); erase();});

                } catch (err) {
                    log_with_time(err);
                }
            })();

        break;

        case 'upvoted':

            if(!_args[1]) return message.channel.send("You need to specify a username!");
            if(!_args[2]) return message.channel.send("You need to specify a number of posts!");

            (async function start() {
                try{
                    let content = JSON.stringify(await reddit.getUser(_args[1]).getUpvotedContent({limit: parseInt(_args[2])}));

                    fs.truncate(file_path, 0, () => {log_with_time("Truncated file!")});

                    fs.writeFile(file_path, content, () => {defaultFunc();});                    
                    
                } catch (err) {
                    log_with_time(err);
                }
            })();

        break;

        case 'downvoted':

            if(!_args[1]) return message.channel.send("You need to specify a username!");
            if(!_args[2]) return message.channel.send("You need to specify a number of posts!");

            (async function start() {
                try{
                    let content = JSON.stringify(await reddit.getUser(_args[1]).getDownvotedContent({limit: parseInt(_args[2])}));

                    fs.truncate(file_path, 0, () => {log_with_time("Truncated file!")});

                    fs.writeFile(file_path, content, () => {defaultFunc(); erase();});                    
                    
                } catch (err) {
                    log_with_time(err);
                }
            })();

        break;

        case 'posts':

            if(!_args[1]) return message.channel.send("You need to specify a username!");
            if(!_args[2]) return message.channel.send("You need to specify a number of posts!");

            (async function start() {
                try{
                    let content = JSON.stringify(await reddit.getUser(_args[1]).getHiddenContent({limit: parseInt(_args[2])}));

                    fs.truncate(file_path, 0, () => {log_with_time("Truncated file!")});

                    fs.writeFile(file_path, content, () => {defaultFunc(); erase();});                    
                    
                } catch (err) {
                    log_with_time(err);
                }
            })();

        break;
    }
});

_client.login(_token).then(log_with_time("Logged win with the token"));