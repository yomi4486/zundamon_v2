const { SlashCommandBuilder,ButtonBuilder,ButtonStyle,ActionRowBuilder } = require('discord.js');
const connection = require('./disconnection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('ボイスチャンネルを切断するのだ'),
    execute: async function(interaction,connection){
        try {
            connection.destroy();
            await interaction.reply('ボイスチャンネルを切断したのだ')
        }catch (error){
            console.error(error)
        }
    }
}
