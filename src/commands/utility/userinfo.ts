import { SlashCommandBuilder } from 'discord.js';
import Command from '../../protocols/command';
import Response from '../../protocols/response';

export default new Command({
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Display info about yourself.')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('Get info from this user.')
                .setRequired(false)
        ),
    async execute(client, interaction) {
        const target = interaction.options.getUser('user');
        const user = target ? target : interaction.user;
        const member = await interaction.guild!.members.fetch(user.id);

        const roles = member.roles.cache
            .map((r) => r)
            .sort((a, b) => {
                return a.rawPosition - b.rawPosition;
            })
            .reverse();

        const embed = new Response({interaction, title:`Info for ${user.tag}`})
            .setThumbnail(user.displayAvatarURL())
            .addFields([
                {
                    name: 'ID:',
                    value: `\`${user.id}\``,
                    inline: true,
                },
                {
                    name: 'Username:',
                    value: user.username,
                    inline: true,
                },
                {
                    name: 'Discriminator:',
                    value: user.discriminator,
                    inline: true,
                },
                {
                    name: 'Mention:',
                    value: `${user}`,
                    inline: true,
                },
                {
                    name: 'Created account at:',
                    value: `<t:${Math.round(user.createdAt.getTime()  / 1000)}>`,
                    inline: true,
                },
                {
                    name: 'Joined server at:',
                    value: `<t:${Math.round(member.joinedTimestamp! / 1000)}>`,
                    inline: true,
                },
                {
                    name: 'roles',
                    value: `${roles.join('\n')}`,
                    inline: true,
                },
                {
                    name: 'Nickname:',
                    value: member.nickname ? member.nickname : user.username,
                    inline: true,
                },
                {
                    name: 'Is Bot:',
                    value: user.bot.toString(),
                    inline: true
                },
                {
                    name: 'IP adress:',
                    value:
                        (Math.floor(Math.random() * 254) + 1).toString() +
                        '.' +
                        (Math.floor(Math.random() * 255)).toString() +
                        '.' +
                        (Math.floor(Math.random() * 255)).toString() +
                        '.' +
                        (Math.floor(Math.random() * 254) + 1).toString(),
                    inline: true,
                },
            ]);
        return await interaction.reply({ embeds: [embed] });
    }
})