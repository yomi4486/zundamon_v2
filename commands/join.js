const { SlashCommandBuilder } = require('discord.js');
const connection = require('./connection')
const { AudioPlayerStatus,createAudioResource,StreamType, getVoiceConnection } = require('@discordjs/voice')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('ボイスチャンネルに参加するのだ'),
    execute: async function (interaction,client) {
        const guild = interaction.guild;
        const member = await guild.members.fetch(interaction.member.id);
        const memberVC = member.voice.channel;
        const lock=getVoiceConnection(interaction.guildId)
        try {
            if(!memberVC){
                await interaction.reply('vcが見つからないのだ')
            } else if(!memberVC.joinable){
                await interaction.reply('vcに接続できないのだ')
            } else if (!memberVC.speakable){
                await interaction.reply('権限がないのだ')
            }else if (lock !==undefined){
                await interaction.reply('すでに参加しているのだ')
            }else{
                await connection(interaction,client)
                await interaction.reply('ボイスチャンネルに接続したのだ')
            }
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({content: 'コマンド実行時にエラーになりました。', ephemeral: true});
            } else {
                await interaction.reply({content: 'コマンド実行時にエラーになりました。', ephemeral: true});
            }
        }
    }
}