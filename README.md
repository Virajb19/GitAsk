# GitSync

GitSync is an AI-powered tool that answers questions about any GitHub repository using RAG—just provide a repo URL and get insights instantly.

https://github.com/user-attachments/assets/794f49e4-a355-479b-9de1-3e5ab2f21239

## How to run locally ?

**1.Clone the repo**

```bash 
git clone https://github.com/Virajb19/GitSync
cd GitSync
```
**2. Install pnpm and then dependencies**

```bash 
npm i -g pnpm
```
```bash
pnpm install
```

**3. Run the server**

```bash
pnpm dev
```

**4. Create .env and add environment variables**

Refer .env.example

**5. Start Database**

Pull postgres image

```bash
docker pull postgres
```
Run docker container

```bash
docker run --name postgres-ctr -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

```
Run this command

```bash
pnpm dlx prisma migrate deploy
```

Run this command to open prisma studio

```bash
pnpm dlx prisma studio
```
Open [http://localhost:5555]

**6. Authentication**

Run this to generate a key

```bash
openssl rand -base64 32
```

Add the key to AUTH_SECRET env var

Go to [https://github.com/settings/apps] and create an OAuth app

GITHUB_CLIENT_ID=""  
GITHUB_CLIENT_SECRET=""  

(Optional. You can just login using Github or Email)

Go to [https://console.cloud.google.com/] and create an OAuth app

GOOGLE_CLIENT_ID="" GOOGLE_CLIENT_SECRET=""

Create an App password (Optional. Just login using github or Email)

You need to enable 2-Step verification in your google account

EMAIL_APP_USER="your_email@gmail.com"
EMAIL_APP_PASSWORD="your_generated_app_password"

**7. Gemini API**

Go to [https://aistudio.google.com/] and create an API key

GEMINI_API_KEY="your_gemini_api_key"

GOOGLE_GENERATIVE_AI_API_KEY="your_gemini_api_key"

**8. GitHub API**

Go to [https://github.com/settings/tokens] and generate a token. Add that token to 

GITHUB_ACCESS_TOKEN=""

**9. Assembly AI**

Get you API key from [https://www.assemblyai.com/]

ASSEMBLY_API_KEY=""

**10. Appwrite Storage**

Get you secret key from [https://appwrite.io/]

APPWRITE_SECRET_KEY=""

Create a project and add project ID here

NEXT_PUBLIC_APPWRITE_PROJECT_ID=""

Create a bucket and add bucket ID here

NEXT_PUBLIC_APPWRITE_BUCKET_ID=""

**11. Stripe**

Go to [https://dashboard.stripe.com/apikeys]

STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"

Install stripe CLI in your system

Run this command

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

A secret will be generated. Add that secret to 

STRIPE_WEBHOOK_SECRET=""




