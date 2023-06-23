import { Message, User, WebhookClient } from "discord.js";
import { ObjectId } from "mongodb";
import { chainCurrent, chainUser } from "../database/database";
import { chainCurrentId, webhooks } from '../config.json'
import logger from "../log/logger";
import Embed from "./embed";

const chainWebhook = new WebhookClient({ url: "https://discord.com/api/webhooks/986356564095033435/cuyecN8UHBT2LLm-8wtoi30ZDQhdWGd3Q-SkJ-eFB2uwuujxBZsK2AxEGZ1F9rcUYYIJ" })

class DontBreakTheChain {
    private static instance: DontBreakTheChain;
    private chain: string = "";
    private lastPerson?: User;
    private length: number = 0
    private isBroken: boolean = false

    public static getInstance() {
        if (!DontBreakTheChain.instance) {
            DontBreakTheChain.instance = new DontBreakTheChain();
        }
        return DontBreakTheChain.instance;
    }

    public async handleNewLink(message: Message) {
        const chainData = await chainCurrent.findOne({
            _id: new ObjectId(chainCurrentId)
        });
        if (!chainData) throw Error("Current chain data was not found!")

        if (message.content.toLowerCase() === chainData.chain) {
            // Check weither the same person said the chain twice
            if (chainData.lastPerson === message.author.id) {
                await message.delete();
                logger.debug("Same author")
                return
            }
            // Chain was correct
            await this.updateChain(message)
            await this.updateUser(message.author, "count")
            this.isBroken = false
            this.chain = message.content
        } else if (chainData.chain == '' || chainData.length < 3) {
            // First word of chain.
            await this.createChain(message)
        } else {
            // Chain was broken
            await this.chainBroken(message)
            await this.updateUser(message.author, "broken")
            this.isBroken = true
            this.length = 0
        }
        this.lastPerson = message.author
        this.updateChainStatus()
    }

    private async createChain(message: Message) {
        logger.debug("First word of chain chain")
        await chainCurrent.updateOne({ _id: new ObjectId(chainCurrentId) }, {
            $set: {
                lastPerson: message.author.id,
                chain: message.content,
                length: 1,
            },
        })
    }
    private async updateChain(message: Message) {
        logger.debug("Update chain")
        const doc = await chainCurrent.findOneAndUpdate({ _id: new ObjectId(chainCurrentId) }, {
            $set: { lastPerson: message.author.id },
            $inc: { length: 1 }
        })
        this.length = doc.value!.length + 1
    }
    private async updateUser(user: User, field: "count" | "broken") {
        logger.debug(`Update user: ${user.username}`)
        await chainUser.findOneAndUpdate(
            { id: user.id },
            {
                $setOnInsert: {
                    id: user.id,
                    [field === "count" ? "broken" : "count"]: 0,
                },
                $inc: { [field]: 1 },
            },
            { upsert: true }
        );
    }
    private async chainBroken(message: Message) {
        logger.debug("Chain broken")
        const a = await chainCurrent.findOneAndUpdate({ _id: new ObjectId(chainCurrentId) }, {
            $set: {
                lastPerson: '',
                chain: '',
                length: 0,
            },
        })
        await message.channel.send(new Embed({
            title: "Chain was broken",
            content: `${message.author} has broken the chain.\nThis chain was **${a.value?.length}** messages long.\nSend a new message to start a new chain.`
        }))
    }

    private async updateChainStatus() {
        const embed = new Embed({
            title: "Don't break the chain"
        }).setFooter({
            text: !this.isBroken
                ? 'There is a chain.'
                : 'There is currently no chain.'
        }).setColor("Blue").setTimestamp(undefined)

        if (this.isBroken) {

        } else {
            embed.addFields([{
                name: "Current chain",
                value: `Chain: \`${this.chain}\`\nLength: \`${this.length}\`\nLast person: ${this.lastPerson}`
            }])
        }
        await chainWebhook.editMessage(webhooks.dont_break_chain.data, embed)
    }
}

const dontBreakTheChain = DontBreakTheChain.getInstance()
export default dontBreakTheChain