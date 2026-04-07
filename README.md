# JRProgramming — Next.js Portfolio Website

[![License: MIT](https://img.shields.io/github/license/jrconway3/jr-programming-core)](./LICENSE)

A portfolio website designed in Next.js/React. Theme is designed to give off a dark theme programming/coding aesthetic.

Github Copilot was used to help support development of this website.


## Initialization

Getting started (PowerShell):

```powershell
cd path\to\jrprogramming
npm install
Copy-Item .env.example .env
```


## Generate Prisma Database

Ensure your `.env` file is created from `.env.example` and the database values are filled out correctly.

```powershell
cd path\to\jrprogramming
npx prisma migrate dev
npx prisma generate
```


## Contact Form Email Configuration

The contact form sends inquiries using SMTP and the recipient address is configured through environment variables.

Local setup uses the same `.env` file created from `.env.example`.

Required values:

```dotenv
CONTACT_EMAIL_TO=you@example.com
CONTACT_EMAIL_FROM=website@example.com
CONTACT_IP_HASH_SECRET=replace-with-a-long-random-secret
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

Use [.env.example](.env.example) as the local template and copy it to `.env` before running the app.


## Admin Area

The site includes a private admin area at `/admin` for inquiries, project management, and category management.

Configure these environment variables before using it:

```powershell
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret
```

After that, start the app with `npm run dev` or `npm run build` and sign in at `http://localhost:3000/admin`.


## Initialize Locally

Build a local version of the React website and initialize a virtual instance.

```
npm run dev
```

Open http://localhost:3000 in your browser.


## Unit Tests

Run the unit test suite with:

```powershell
npm test
```

Run tests in watch mode during development with:

```powershell
npm run test:watch
```

Current unit coverage includes contact form validation and spam scoring rules.


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
