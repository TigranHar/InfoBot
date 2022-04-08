"use strict";

//#region imports

const functions = require("./methods/functions.js");

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

const {log_with_time} = require('./methods/functions.js');

config();

//#endregion imports


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
    functions.log_with_time(`Logged in as ${_client.user.tag}`);
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
                functions.log_with_time(err);
                 failEmbed("Something went wrong!");;
            }

            break;

        case 'comments':

            (async () => {            
                let comments = JSON.stringify(await reddit.getUser(_args[1]).getComments({
                    limit: parseInt(_args[2])
                }));
                let result = `${comments.substring(comments.length - 1, 0)}]`;
                let message_to_send = JSON.parse(String(result.replace('\"md', '\"md')));

                if (!_args[1]) return message.channel.send("You need to specify a username!");
                if (!_args[2]) return message.channel.send("You need to specify a number of comments!");

                functions.commentFunc(_args, message, message_to_send);
            })();
            
            break;

        case 'saved':

            if (!_args[1]) return message.channel.send("You need to specify a username!");
            if (!_args[2]) return message.channel.send("You need to specify a number of posts!");

            (async function start() {
                try {
                    let content = JSON.parse(JSON.stringify(await reddit.getUser(_args[1]).getSavedContent({
                        limit: parseInt(_args[2])
                    })));

                    functions.defaultFunc(content, _args, message);
                } catch (err) {
                    functions.log_with_time(err);
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

                    functions.defaultFunc(content, _args, message);
                } catch (err) {
                    functions.log_with_time(err);
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

                    functions.defaultFunc(content, _args, message);
                } catch (err) {
                    functions.log_with_time(err);
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

                    functions.defaultFunc(content, _args, message);
                } catch (err) {
                    functions.log_with_time(err);
                     failEmbed("Something went wrong!");;
                }
            })();

            break;
    }
});

_client.login(_token).then(functions.log_with_time("Logged win with the token"));