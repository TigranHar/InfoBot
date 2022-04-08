const {
    MessageEmbed
} = require('discord.js');

const {
    pagination
} = require('reconlx');

//#region variables

let overloaded_bot = false;
let multiple_embeds = false;

//#endregion variables

function log_with_time(message) {
    console.log(`[${String(new Date()).substring(0, 24)}] ${message}`);
 } 

function failEmbed(error_message, color, message) {
    const embed = new MessageEmbed();
    embed.color = color;
    embed.setTitle(error_message);

    message.channel.send({
        embeds: [embed]
    });
}

async function defaultFunc(content, _args, message) {

    if(overloaded_bot && multiple_embeds) {
        failEmbed("The bot is currently overloaded. Please wait until the bot replies that it is ready again.", 0xFF0000, message);

        return setTimeout(() => {
            overloaded_bot = false;
            failEmbed("The bot is now ready!", 0x00FF00, message);
        }, 20000);
    } else {
        multiple_embeds = false;
    }

    try {

        let num_closest_divisor_by_10 = Math.trunc(content.length / 10) * 10;

        const embeds = [];
        let embed = new MessageEmbed();
        embed.color = 0x00ff00;
        embed.setTitle(`${_args[1]}'s content posts`);

        for (let i = 0; i < content.length; i++) {

            if(content.length > 10 && i === 0) { 
                embed.addField(`WARNING!!!`, 'You requested more than 20 posts, if you go too fast the bot will not respond, you have 20 seconds.'); 
                overloaded_bot = true;
                multiple_embeds = true;
            } 

            if((i) === num_closest_divisor_by_10) {
                embed = new MessageEmbed();
                embed.color = 0x00ff00;
                embed.setTitle(`${_args[1]}'s content posts`);
            }

            embed.addField(`Post ${i + 1} (from ${content[i].subreddit_name_prefixed}):`, `https://reddit.com${content[i].permalink}`);

            if((i + 1) % 10 === 0 && (i + 1) > 9) {
                embeds.push(embed);
                embed = new MessageEmbed();
                embed.color = 0x00ff00;
                embed.setTitle(`${_args[1]}'s content posts`);
            }

            if(i + 1 == content.length) {
                embeds.push(embed);
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
        failEmbed("Something went wrong!", 0xFF0000, message);
    }
}

async function commentFunc(_args, message, message_to_send) {

    let num_closest_divisor_by_10 = Math.trunc(content.length / 10) * 10;

    if(overloaded_bot && multiple_embeds) {
        failEmbed("The bot is currently overloaded. Please wait until the bot replies that it is ready again.", 0xFF0000, message);

        return setTimeout(() => {
            overloaded_bot = false;
            failEmbed("The bot is now ready!", 0x00FF00, message);
        }, 20000);
    } else {
        multiple_embeds = false;
    }

    let embed = new MessageEmbed();
    const embeds = [];
    embed.color = 0x00ff00;
    embed.setTitle(`${_args[1]}'s comments`);

    try {

        for (let i = 0; i < message_to_send.length; i++) {

            if(message_to_send.length > 20 && i == 0) { 
                embed.addField(`WARNING!!!`, 'You requested more than 20 comments, if you go too fast the bot will not respond, you have 20 seconds.'); 
                overloaded_bot = true;
                multiple_embeds = true;
            }

            if((i) === num_closest_divisor_by_10) {
                embed = new MessageEmbed();
                embed.color = 0x00ff00;
                embed.setTitle(`${_args[1]}'s content posts`);
            }

            embed.addField(`Comment ${i + 1} from subreddit r/${message_to_send[i].subreddit}:`, `${message_to_send[i].body}`);
            
            if((i + 1) % 10 === 0 && (i + 1) > 10) {
                embeds.push(embed);
                embed = new MessageEmbed();
                embed.color = 0x00ff00;
                embed.setTitle(`${_args[1]}'s content comments`);
            }

            if(i + 1 == content.length) {
                embeds.push(embed);
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
         failEmbed("Something went wrong!", 0xFF0000, message);
    }

}

class functions {
    constructor() {
        this.log_with_time = log_with_time;
        this.defaultFunc = defaultFunc;
        this.commentFunc = commentFunc;
        this.overloaded_bot = overloaded_bot;
        this.multiple_embeds = multiple_embeds;
    }
}

module.exports = new functions();