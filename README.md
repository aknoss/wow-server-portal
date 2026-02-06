# World of Warcraft Server Portal

This is a web application to introduce users to my private World of Warcraft TBC server. It has three main functionalities:

- Signup page to create a game account directly in the game's database.
- A link to download the game.
- Main page to show the status of the server and information.

The WoW server is implemented with [cmangos TBC](https://cmangos.net/).

The authentication uses SRP (Secure Remote Password protocol) to hash the password.

## Environment variables

- Create a `.env` file and add database credentials following the `.env.example` file.

## Production

- Install dependencies

```
npm install
```

- Build typescript

```
npm run build
```

- Run server

```
npm start
```

## Development

- Install dependencies

```
npm install
```

- Run development

```
npm run dev
```
