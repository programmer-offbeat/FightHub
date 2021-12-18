
const { Message, Client, MessageEmbed } = require('discord.js')
const db = require('../database/models/user')
const ms = require('ms')
module.exports = {
    name: 'message',
    once: false,
    /**
     * 
     * @param {Message} message 
     * @param {Client} client 
     */
    async execute(message, client) {
        if (!message.guild) return;
        if (message.guild.id !== client.storage.fighthub.id) return;
        if (message.channel.id !== '826929140019232788') return; // vote channel
        if (message.author.id !== '479688142908162059') return; // vote tracker

        if (!message.embeds) return;

        const user = client.users.cache.get(message.embeds[0].description.split("(id:")[1].split(")")[0]) || null

        if (!user) return;
        console.log(user)

        let dbUser = await db.findOne({ userID: message.author.id })
        if (!dbUser || !dbUser.fighthub.voting) {
            dbUser = new db({
                userId: message.author.id,
                fighthub: {
                    voting: {
                        hasVoted: true,
                        lastVoted: new Date().getTime() + ms("12h"),
                        enabled: true
                    }
                }
            })
        }
        if (!dbUser.fighthub.voting.enabled) return; // disabled reminders

        dbUser.fighthub = {
            voting: {
                hasVoted: true,
                lastVoted: new Date().getTime() + ms("12h"),
                enabled: true
            }
        }
        dbUser.save()

        user.send(
            new MessageEmbed()
                .setTitle("Thank you for voting!")
                .setDescription(`You have voted for **[FightHub](https://discord.gg/fight)** and got the \`・Voter\` role for 12 hours!\n\nYou will be reminded <t:${(dbUser.fighthub.voting.lastVoted / 1000).toFixed(0)}:R> to vote again! You can toggle vote reminders by running \`fh voterm\`.`)
                .setColor("GREEN")
                .setTimestamp()
                .setThumbnail(client.storage.fighthub.iconURL())
        )

            (await client.fetchWebhook("921645605070200852")).send(`**${user.tag}** voted for the server.`)
    }
}