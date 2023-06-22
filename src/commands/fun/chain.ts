import { SlashCommandBuilder } from 'discord.js';
import Command from '../../protocols/command';
import Response from '../../protocols/response';
import { chainUser, chainCurrent } from '../../database/database';
import { channelIds } from '../../config.json'
import { ObjectId } from 'mongodb';
import { emptyField } from '../../protocols/embed';


function round(num: number, acc: number) {
    return Math.round((num + Number.EPSILON) * acc) / acc;
}
export default new Command({
    data: new SlashCommandBuilder()
        .setName('chain')
        .setDescription("Get top players from don't break the chain.")
        .addUserOption((option) =>
            option.setName('target').setDescription('Chain info about this user.')
        ),
    async execute(client, interaction) {
        const user = interaction.options.getUser('target');

        const response = new Response({ interaction, title: "Chain Info" })
        if (user) {
            const target = await chainUser.findOne({ id: user.id });
            if (!target) {
                response
                    .setTitle(`${user.username}'s data:`)
                    .setDescription(
                        `We couldn't find any data for <@${user.id}>\nAsk them to say the chain in <#${channelIds.dontBreakChain}> first.`
                    );
                return await interaction.reply({ embeds: [response] });
            }
            response
                .setTitle(`${user.tag}'s data:`)
                .setDescription(
                    `* Chain count: \`${target.count}\`\n` +
                    `* Chains broken: \`${target.broken}\`\n` +
                    `* Break rate: \`${round(
                        (target.broken /
                            (target.count + target.broken)) *
                        100,
                        10000
                    )}%\``
                );
            return await interaction.reply({ embeds: [response] });
        }

        // Get the top 10 users from database.
        const topUsers = await chainUser.find({}, {
            sort: { count: -1 },
            limit: 10
        })

        let i = 0
        let topUsersList = ''
        for await (const user of topUsers) {
            const text = ` ▸ Score: \`${user.count}\` ▸ Chains broken: \`${user.broken}\``;
            const underline = interaction.user.id === user.id ? '__' : ''
            topUsersList += `\`#${(i + 1).toString().padEnd(2)}\` | ${underline}<@${user.id}>:${text}${underline}\n`;
            i++;
        }
        response.addFields({
            name: "Top users",
            value: topUsersList
        })

        // Require date from current chain
        const chainInfo = await chainCurrent.findOne({
            _id: new ObjectId("649497d59b3d22645f1eab0a")
        });
        if (chainInfo && true)
            response.addFields({
                name: 'Current chain',
                value: `The current chain is \`${chainInfo?.chain}\`.\nThe chain was last said by <@${chainInfo.lastPerson}> and is currently ${chainInfo.length} messages long`
            })
        await interaction.reply(response);
    }
})