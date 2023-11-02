
export const emptyCharachter = '\u200B'
export const emptyField = { name: emptyCharachter, value: emptyCharachter }

export interface MessageOptions {
    content: string,
    fetchReply?: boolean
}

export default class Message {
    content?: string | undefined;
    tts?: boolean = false;
    fetchReply?: boolean | undefined;
    embeds = []

    constructor(content: string, fetchReply?: boolean)
    constructor({ content, fetchReply }: MessageOptions)
    constructor(args: string | MessageOptions, fetch?: boolean) {
        if (typeof args === 'string') {
            // Handle constructor with string parameter
            this.content = args;
            this.fetchReply = fetch
        } else {
            // Handle constructor with MessageOptions parameter
            const { content, fetchReply } = args;
            this.content = content;
            this.fetchReply = fetchReply;
        }
    }
}