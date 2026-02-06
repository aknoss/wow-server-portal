# World of Warcraft Server Portal

This is a web application to introduce users to my private World of Warcraft server. It has three main functionalities:

- Signup page to create a game account directly in the game's database.
- A link to download the game.
- Main page to show the status of the server and information.

The WoW server is implemented with cmangos(https://cmangos.net/).

The authentication uses SRP (Secure Remote Password protocol) to hash the password.

## Running

- Create a `.env` file and add database credentials following the `.env.example` file.

- Run

```
npm install
```

- Run

```
npm run build
```

- Run

```
npm start
```

## Development

- Run

```
npm install
```

- Run

```
npm run dev
```
