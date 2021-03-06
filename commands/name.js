import { getCharacter } from '../api.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { serverCaseCheck } from '../utils/serverCaseCheck.js';
import rolesConfig from '../configs/rolesConfig.js';
const { newbie } = rolesConfig;

export default {
    data: new SlashCommandBuilder()
        .setName('name')
        .setDescription('Checks lodestone and sets your discord nickname')
        .addStringOption((option) => option.setName('nickname')
            .setDescription('your in-game username')
            .setRequired(true))
        .addStringOption((option) => option.setName('server')
            .setDescription('the server your character is on')
            .setRequired(true)),
    async execute (interaction) {
        // TODO: change this to use the built in permission system.
        if (!interaction.member.roles.cache.has(newbie)) {
            const notNewUserEmbed = new MessageEmbed()
                .setColor('#d40000')
                .setTitle('Only new members can use this command')
                .setTimestamp();
            await interaction.reply({
                content: null,
                embeds: [notNewUserEmbed],
            });
            return;
        }
        const newNick = interaction.options.getString('nickname');
        const serverArg = interaction.options.getString('server');

        const server = serverCaseCheck(serverArg);

        if (!server) {
            const unknownServerEmbed = new MessageEmbed()
                .setColor('#d40000')
                .setTitle(`Invalid server name: ${serverArg}`)
                .setTimestamp();
            await interaction.reply({
                content: null,
                embeds: [unknownServerEmbed],
            });
            return;
        }

        await getCharacter(newNick, server)
            .then(async (data) => {
                if (!data) {
                    const nickFailEmbed = new MessageEmbed()
                        .setColor('#d40000')
                        .setTitle('Authentication failure')
                        .setAuthor({
                            name: 'Augur',
                            iconURL: 'https://i.imgur.com/KpGs20S.jpeg',
                            url: null,
                        })
                        .setDescription(`No ${newNick} on server: ${server}`)
                        .setTimestamp()
                        .setFooter({
                            text: 'All information sourced from lodestone',
                            iconURL: null,
                        });
                    await interaction.reply({
                        content: null,
                        embeds: [nickFailEmbed],
                    });
                } else {
                    const newNickEmbed = new MessageEmbed()
                        .setColor('#02d642')
                        .setTitle('Authentication success')
                        .setAuthor({
                            name: 'Augur',
                            iconURL: 'https://i.imgur.com/KpGs20S.jpeg',
                            url: null,
                        })
                        .setDescription(
                            `${newNick} found on server: ${server}`,
                        )
                        .setImage(data.Avatar)
                        .setTimestamp()
                        .setFooter({
                            text: 'All information sourced from lodestone',
                            iconURL: null,
                        });
                    await interaction.reply({
                        content: null,
                        embeds: [newNickEmbed],
                    });
                    await interaction.member.setNickname(newNick);
                }
            });
    },
};
