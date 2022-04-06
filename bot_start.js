"use strict";

//#region imports
const commands_impl = require('./commands.json');

const fs = require('fs');

const {
    Client,
    Intents
} = require('discord.js');

const _client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

const {
    MessageEmbed
} = require('discord.js');

const Reddit = require('snoowrap');

const {
    CommentStream
} = require('snoostorm');

const {
    config
} = require('dotenv');
const {
    url
} = require('inspector');

const {
    pagination
} = require('reconlx');

config();

//#endregion imports

//#region _functions

function log_with_time(message) {
   console.log(`[${String(new Date()).substring(0, 24)}] ${message}`);
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

//#region variables

let overloaded_bot = false;
let multiple_embeds = false;

//#endregion variables

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

    function failEmbed(error_message, color ="0xFF0000") {
        const embed = new MessageEmbed();
        embed.color = color;
        embed.setTitle(error_message);

        message.channel.send({
            embeds: [embed]
        });
    }

    async function commentFunc() {

        if(overloaded_bot && multiple_embeds) {
            failEmbed("The bot is currently overloaded. Please wait until the bot replies that it is ready again.");

            return setTimeout(() => {
                overloaded_bot = false;
                failEmbed("The bot is now ready!", "0x00FF00");
            }, 20000);
        }

        let embed = new MessageEmbed();
        const embeds = [];
        embed.color = "0x00ff00";
        embed.setTitle(`${_args[1]}'s comments`);

        try {
            let comments = JSON.stringify(await reddit.getUser(_args[1]).getComments({
                limit: parseInt(_args[2])
            }));
            let result = `${comments.substring(comments.length - 1, 0)}]`;
            let message_to_send = JSON.parse(String(result.replace('\"md', '\"md')));


            for (let i = 0; i < message_to_send.length; i++) {

                if(message_to_send.length > 20 && i == 0) { 
                    embed.addField(`WARNING!!!`, 'You requested more than 20 comments, if you go too fast the bot will not respond, you have 20 seconds.'); 
                    overloaded_bot = true;
                    multiple_embeds = true;
                }

                if (message_to_send[i].body.length < 1024) {
                    embed.addField(`Comment ${i + 1} from subreddit r/${message_to_send[i].subreddit}:`, `${message_to_send[i].body}`);
                }

                if((i + 1) % 10 === 0 && (i + 1) > 9) {
                    embeds.push(embed);
                    embed = new MessageEmbed();
                    embed.color = "0x00ff00";
                    embed.setTitle(`${_args[1]}'s content comments`);
                }

            }

            if(multiple_embeds) {
                return await pagination({
                    embeds: embeds,
                    author: message.author,
                    channel: message.channel,
                    time: 20000
                });
            }

            message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.log(err);
             failEmbed("Something went wrong!");;
        }

    };

    async function defaultFunc(content) {

        if(overloaded_bot && multiple_embeds) {
            failEmbed("The bot is currently overloaded. Please wait until the bot replies that it is ready again.");

            return setTimeout(() => {
                overloaded_bot = false;
                failEmbed("The bot is now ready!", "0x00FF00");
            }, 20000);
        }

        try {
            const embeds = [];
            let embed = new MessageEmbed();
            embed.color = "0x00ff00";
            embed.setTitle(`${_args[1]}'s content posts`);

            for (let i = 0; i < content.length; i++) {

                if(content.length > 20 && i == 0) { 
                    embed.addField(`WARNING!!!`, 'You requested more than 20 posts, if you go too fast the bot will not respond, you have 20 seconds.'); 
                    overloaded_bot = true;
                    multiple_embeds = true;
                }

                if (content[i].subreddit_name_prefixed === null || 
                    content[i].subreddit_name_prefixed === undefined || 
                    content[i].permalink === undefined || 
                    content[i].permalink === null) {
                    return embed.addField(`Post ${i + 1}:`, 'Post not found!');
                }

                embed.addField(`Post ${i + 1} (from ${content[i].subreddit_name_prefixed}):`, `https://reddit.com${content[i].permalink}`);

                if((i + 1) % 10 === 0 && (i + 1) > 9) {
                    embeds.push(embed);
                    embed = new MessageEmbed();
                    embed.color = "0x00ff00";
                    embed.setTitle(`${_args[1]}'s content posts`);
                }
            }

            if(multiple_embeds) {
                return await pagination({
                    embeds: embeds,
                    author: message.author,
                    channel: message.channel,
                    time: 20000
                });
            }

            message.channel.send({ embeds: [embed] });

        } catch (err) {
            log_with_time(err);
             failEmbed("Something went wrong!");;
        }
    }

    switch (_args[0]) {

        case "help":

            try {
                const help_embed = new MessageEmbed();

                help_embed.setColor('#0099ff');
                help_embed.setTitle('Instagram account booster');
                help_embed.addFields({
                    name: '\u200B',
                    value: '\u200B'
                }, {
                    name: '**Commands**',
                    value: '**↓**',
                    inline: true
                }, {
                    name: 'Prefix',
                    value: '``.``',
                    inline: true
                }, )
                help_embed.setTimestamp(new Date());
                help_embed.setFooter({
                    text: "Deliverd on ",
                    iconURL: _client.user.avatarURL()
                })

                let i = 0

                commands_impl.commands.forEach(() => {
                    help_embed.addField(commands_impl.commands[i].command, commands_impl.commands[i].description);
                    i++;
                })

                message.channel.send({
                    embeds: [help_embed]
                });

            } catch (err) {
                log_with_time(err);
                 failEmbed("Something went wrong!");;
            }

            break;

        case 'comments':

            if (!_args[1]) return message.channel.send("You need to specify a username!");
            if (!_args[2]) return message.channel.send("You need to specify a number of comments!");

            commentFunc();
            
            break;

        case 'saved':

            if (!_args[1]) return message.channel.send("You need to specify a username!");
            if (!_args[2]) return message.channel.send("You need to specify a number of posts!");

            (async function start() {
                try {
                    let content = JSON.parse(JSON.stringify(await reddit.getUser(_args[1]).getSavedContent({
                        limit: parseInt(_args[2])
                    })));

                    defaultFunc(content);
                } catch (err) {
                    log_with_time(err);
                    failEmbed("Something went wrong!");
                }
            })();

            break;

        case 'upvoted':

            if (!_args[1]) return message.channel.send("You need to specify a username!");
            if (!_args[2]) return message.channel.send("You need to specify a number of posts!");

            (async function start() {
                try {
                    let content = JSON.parse(JSON.stringify(await reddit.getUser(_args[1]).getUpvotedContent({
                        limit: parseInt(_args[2])
                    })));

                    defaultFunc(content);
                    console.log(content.length);
                } catch (err) {
                    log_with_time(err);
                     failEmbed("Something went wrong!");;
                }
            })();

            break;

        case 'downvoted':

            if (!_args[1]) return message.channel.send("You need to specify a username!");
            if (!_args[2]) return message.channel.send("You need to specify a number of posts!");

            (async function start() {
                try {
                    let content = JSON.parse(JSON.stringify(await reddit.getUser(_args[1]).getDownvotedContent({
                        limit: parseInt(_args[2])
                    })));

                    defaultFunc(content);
                } catch (err) {
                    log_with_time(err);
                     failEmbed("Something went wrong!");;
                }
            })();

            break;

        case 'posts':

            if (!_args[1]) return message.channel.send("You need to specify a username!");
            if (!_args[2]) return message.channel.send("You need to specify a number of posts!");

            (async function start() {
                try {
                    let content = JSON.parse(JSON.stringify(await reddit.getUser(_args[1]).getSubmissions({
                        limit: parseInt(_args[2])
                    })));

                    defaultFunc(content);
                } catch (err) {
                    log_with_time(err);
                     failEmbed("Something went wrong!");;
                }
            })();

            break;

        case 'test':

            if (!_args[1]) return message.channel.send("You need to specify a username!");
            if (!_args[2]) return message.channel.send("You need to specify a number of posts!");

            (async function start() {
                let content = JSON.parse(JSON.stringify(await reddit.getUser(_args[1]).getComments({
                    limit: parseInt(_args[2])
                })));

                defaultFunc(content);
            })();

            break;
    }
});

_client.login(_token).then(log_with_time("Logged win with the token"));