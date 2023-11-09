# MyBot

A Discord bot.

---

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
  - [Getting Started](#getting-started)
  - [Configuration](#configuration)

---

## Features

- Slash commands
- Dont break the chain. A word in a channel has to be repeated. Scores are stored in database.

## Technologies Used

- [Node.js](https://nodejs.org/)
  - [discord.js](https://discord.js.org/)
- [MongoDB](https://www.mongodb.com/)

## Contributing

If you'd like to contribute to this project, please open an issue or submit a pull request with your proposed changes. I welcome any contributions or improvements!

Here are the steps to make contributions:

1. Fork the repository.
1. Create a new branch for your feature or bug fix.
1. Make your changes and commit them.
1. Push your branch to your fork.
1. Create a pull request to the main repository.

### Getting Started

What you first need to do are the steps mentioned in [discordjs](https://discordjs.guide/preparations/) to set up a discord bot. Add it to your server. Now you're done setting up the bot.

To run this project locally, follow these steps:

1. Clone the Repository:

```bash
git clone https://github.com/SimonStnn/MyBot.git
cd website
```

2. Install Dependencies:

```bash
npm install
```

3. Make `.env` from [.env.template](.env.template) and put in tokens and keys.

4. Run the Development Server:

```bash
tsc --project ./tsconfig.json
npm run dev
```

Now the bot should be online.

> You can also start a debug session with vs-code.

### Configuration

You should also update the `src/config.json` to match your values.
