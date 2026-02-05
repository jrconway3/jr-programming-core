# JRProgramming — Next.js Portfolio Website

[![License: MIT](https://img.shields.io/github/license/jrconway3/jr-programming-core)](./LICENSE)

A portfolio website designed in Next.js/React. Theme is designed to give off a dark theme programming/coding aesthetic.

Github Copilot was used to help support development of this website.


## Initialization

Getting started (PowerShell):

```powershell
cd path\to\jrprogramming
npm install
```


## Generate Prisma Database

Ensure your .env vars have the DB config filled out correctly.

```powershell
cd path\to\jrprogramming
npx prisma migrate dev
npx prisma generate
```


## Initialize Locally

Build a local version of the React website and initialize a virtual instance.

```
npm run dev
```

Open http://localhost:3000 in your browser.


## Install Production

SSH into your production server and go to the public direct.

```powershell
ssh user@remote.com
cd path\to\jrprogramming
```

Now build the production environment by omitting development modules.
```
npm run build
npm ci --omit=dev
```

Finally, initialize pm2. You'll need to install pm2 globally first:
```
npm install pm2 -g
```

After pm2 is installed, start it:
```
pm2 start npm --name "jrprogramming" -- start
```

If you make changes after its already installed, you need to reload it first:
```
pm2 reload jrprogramming || pm2 restart jrprogramming
```


## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
