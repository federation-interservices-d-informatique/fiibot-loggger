import { CommandInteraction } from "discord.js";
import {
    fiiClient,
    Command
} from "@federation-interservices-d-informatique/fiibot-common";
import { getLogChanID } from "../utils/getLogChan.js";
export default class PingCommand extends Command {
    constructor(client: fiiClient) {
        super(
            client,
            {
                name: "logchan",
                description: "Changer le canal des logs",
                options: [
                    {
                        type: "CHANNEL",
                        name: "channel",
                        description: "Le nouveau canal de logs",
                        required: false
                    }
                ]
            },
            {
                userPermissions: ["ADMINISTRATOR"],
                guildOnly: true
            }
        );
    }
    async run(inter: CommandInteraction): Promise<void> {
        const chan = inter.options.get("channel")?.channel;
        if (chan) {
            if (chan.type !== "GUILD_TEXT") {
                inter.reply({
                    ephemeral: true,
                    content: `Le canal <#${chan.id}> n'est pas un canal textuel mais un canal de type ${chan.type}!`
                });
                return;
            }
            await this.client.dbclient.query(
                "INSERT INTO guild_settings (id, logchan) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET logchan = $2",
                [inter.guildId, chan.id],
                (err) => {
                    if (err) {
                        inter.reply({
                            ephemeral: true,
                            content: `Impossible de joindre la base de données: ${err}`
                        });
                    }
                }
            );
            inter.reply({
                ephemeral: true,
                content: `Nouveau canal de logs: ${chan.toString()}`
            });
        } else {
            const chan = await getLogChanID(this.client, inter.guild);
            if (!chan) {
                inter.reply({
                    ephemeral: true,
                    content: "Aucun canal de logs n'a été défini!"
                });
            } else {
                inter.reply({
                    ephemeral: true,
                    content: `Le canal de logs est <#${chan}>`
                });
            }
        }
    }
}
