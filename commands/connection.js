const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus,St} = require('@discordjs/voice');
const {createAudioPlayer,AudioPlayerStatus,createAudioResource,StreamType} = require('@discordjs/voice');
const axios =require('axios')
const {PassThrough} = require('stream')
require('dotenv').config();
const player = createAudioPlayer()

try {
    module.exports = async function(interaction,client) {
    const guild = interaction.guild
    const vc = await guild.members.fetch(interaction.member.id)
    try {
        const connection = joinVoiceChannel({
            channelId: vc.voice.channel.id,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        connection.subscribe(player)
        const vc_channel=vc.voice.channel

        const func = async msg => {
            if (msg.guildId === interaction.guildId && msg.channelId === interaction.channelId && !msg.author.bot){
                if(String(msg.content).length<150){
                    try {
                        await voicevox_yomiage(msg.content)
                    } catch (error) {
                        console.error(error)
                    }
                }else{
                    return
                }
                
            }
        }

        async function voicevox_yomiage(msg) {
            msg = await msg_text(msg)
            const stream = await speakTextUsingVoicevox(msg);
            await AudioPlay(stream)
        }

        /**
         * 文字列の修正
         *
         * @returns msg
         */
        async function msg_text(msg){
            if(msg.indexOf('<') !== -1){
                console.log(msg)
                msg = msg.replace(/[0-90-9]/g, ' ').replace('<',' ').replace(':',' ').replace('>',' ')
            }

            if(msg.indexOf('http') !== -1){
                msg = "URL"
            }

            if (msg.indexOf('.') !== -1) {
                msg=""
            }
            return msg
        }

        /**
         * voicevoxを使ったオーディオデータ取得
         * @params String
         * @returns AudioData
         */
        async function speakTextUsingVoicevox(msg) {
            const rpc = axios.create({ baseURL: `${process.env.baseURL}`, proxy: false });
            const audio_query = await rpc.post('audio_query', {}, {
                params: {
                    text: msg,
                    speaker: 1,
                }
            });
            console.log("[ " + msg + " ]" + "===> VOICEVOX API");
            let requestBody = {
                ...audio_query.data,
                speedScale: 1.0,
            };
            const synthesis = await rpc.post("synthesis", requestBody, {
                responseType: 'stream',
                headers: {
                    "Accept": "audio/wav",
                    "Content-Type": "application/json"
                },
                params: {
                    speaker: 1,
                }
            });
            return synthesis.data;
        }

        /**
         * 読み上げが終わるまで待機する
         */
        async function waitUntilPlayFinish(player) {
            return new Promise((resolve, _) => {
                if (player.state.status === AudioPlayerStatus.Idle) {
                    return resolve();
                }
                player.once(AudioPlayerStatus.Idle, () => {
                    resolve();
                });
            });
        }

        /**
         * 音声データの再生
         * @params stream
         * @params player
         */
        async function AudioPlay(stream){
            let resource = createAudioResource(stream, { inputType: StreamType.Arbitrary, inlineVolume: true });
            await waitUntilPlayFinish(player);
            player.play(resource);
        }

        client.on('messageCreate', func);

        connection.once(VoiceConnectionStatus.Disconnected, ()=>{
            client.off('messageCreate', func);
        });

        connection.once(VoiceConnectionStatus.Destroyed, ()=>{
            client.off('messageCreate', func);
        });
    } catch (error) {
        console.error(error);
    }
}
} catch (error) {
    console.error(error);
}