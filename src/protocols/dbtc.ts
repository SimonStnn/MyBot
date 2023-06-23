import { Message, User } from "discord.js";
import { AcceptedFields, NumericType, ObjectId } from "mongodb";
import { chainCurrent, chainUser, chainUserSchema } from "../database/database";
import { chainCurrentId } from '../config.json'
import logger from "../log/logger";
import Embed from "./embed";

class DontBreakTheChain {
    private static instance: DontBreakTheChain;
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
            return
        } else if (chainData.chain == '' || chainData.length < 3) {
            // First word of chain.
            await this.createChain(message)
            return
        }
        // Chain was broken
        await this.chainBroken(message)
        await this.updateUser(message.author, "broken")
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
        await chainCurrent.updateOne({ _id: new ObjectId(chainCurrentId) }, {
            $set: { lastPerson: message.author.id },
            $inc: { length: 1 }
        })

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
}

const dontBreakTheChain = DontBreakTheChain.getInstance()
export default dontBreakTheChain