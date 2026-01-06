import {
    getServerSession,
    type DefaultSession,
    type NextAuthOptions,
  } from "next-auth";
  import { db } from "~/server/db"
  import CredentialsProvider from "next-auth/providers/credentials";
  import GitHubProvider from "next-auth/providers/github";
  import GoogleProvider from "next-auth/providers/google";
  import { SignInSchema } from "~/lib/zod";
  import bcrypt from 'bcrypt'
  
  declare module "next-auth" {
    interface Session extends DefaultSession {
      user: {
        id: number,
        credits: number,
        emailVerified: boolean
      } & DefaultSession["user"];
    }
  }
  
  declare module 'next-auth/jwt' {
    interface JWT {
        id: number,
        credits: number,
        emailVerified: boolean
    }
  }
  
  export const authOptions: NextAuthOptions = {
    callbacks: {
      jwt: async ({user, token, trigger}) => {
        // if(user) {
        //   const existingUser = await db.user.findFirst({where: { OR: [{OauthId: user.id}, { id: parseInt(user.id)}]}, select: {id: true, credits: true}})
        //   if(existingUser) {
        //     token.id = existingUser.id
        //     token.credits = existingUser.credits
        //   }
        // } else {
        //   const db_User = await db.user.findUnique({ where: { id: token.id}, select: { credits: true}})
        //   if(db_User) token.credits = db_User.credits
        // }
         if(token && token.sub) {
          const existingUser = await db.user.findFirst({where: { OR: [{OauthId: token.sub}, { id: parseInt(token.sub)}]}, select: {id: true, credits: true, emailVerified: true}})
          if(existingUser) {
            token.id = existingUser.id
            token.credits = existingUser.credits
            token.emailVerified = !!existingUser.emailVerified
          }
         }
         return token
      },
      session: async ({session, token}) => {
        if(token && session && session.user) {
          session.user.name = token.name
          session.user.id = token.id 
          session.user.credits = token.credits
          session.user.emailVerified = token.emailVerified
        }
        return session
      },
      signIn: async ({ user, account, profile}) => {
       try {

        // Basically , I created account with github and default email was virajb853@gmail.com 
        // Then I created an account with google/credentials with email virajb004@gmail.com
        // Then I changed my default email in github to virajb004@gmail.com 
        // logged out of app
        // Then when I log in again it gets the existingUser from OauthId and since existingUser is there
        // it tries to update the email to virajb004@gmail.com
        // but user with virajb004@gmail.com already exists
        // since email must be unique it throws error

        // To solve this for now, delete user with email virajb004@gmail from database  

         if (!account || !user.email) return false

         if(account.provider && profile) {
  
          const provider = account.provider === 'github' ? 'GITHUB' : 'GOOGLE'
           
          // VERY IMPORTANT --> Dont update the email if user exits 
          // Refer this -> https://chatgpt.com/c/695be2a4-297c-8324-8706-42bed407ee3b

          // Can we remove the unique constraint from email ?? --> ITS BAD dont do that 
          // better avoid updating email if email is updated in an Oauth provider 
          // update other things like if you changed profilePicture

           const existingUser = await db.user.findFirst({where: { OR: [{email: user.email!}, {OauthId: user.id}]}, select: {id: true}})
           if(existingUser) {
             await db.user.update({
              where: {id: existingUser.id},
              data: {lastLogin: new Date(), username: user.name ?? undefined, email: user.email ?? undefined, ProfilePicture: user.image, OauthProvider: provider, OauthId: user.id}
             })
             // Make email optional in schema because some providers do not provide email
           } else {
              await db.user.create({
                data: {
                  username: user.name ?? "unknown",
                  email: user.email ?? `${user.id}@${provider.toLowerCase()}.oauth`,
                  emailVerified: new Date(),
                  ProfilePicture: user.image,
                  OauthId: user.id,
                  OauthProvider: provider
                }
              })
           }     
         }

    //        await db.user.upsert({
    //   where: { email: user.email }, // ✅ email is identity
    //   update: {
    //     username: user.name ?? undefined,
    //     ProfilePicture: user.image ?? undefined,
    //     lastLogin: new Date(),
    //     OauthProvider: provider,
    //     OauthId: account.providerAccountId, // ✅ correct ID
    //   },
    //   create: {
    //     username: user.name ?? "unknown",
    //     email: user.email, // ✅ set once
    //     emailVerified: new Date(),
    //     ProfilePicture: user.image ?? undefined,
    //     OauthProvider: provider,
    //     OauthId: account.providerAccountId,
    //     lastLogin: new Date(),
    //   },
    // })


      // IF ACCOUNT MODEL IS THERE IN SCHEMA
      // ONE PROVIDER = ONE ACCOUNT
      // THIS IS BETTER 
      // FIXES EMAIL CHANGE PROBLEM 

      // --> SIGNIN 1

  //   signIn: async ({ user, account }) => {
  // try {
  //   if (!account || account.provider === "credentials") return true

  //   let dbUser = null

  //   // 1. If email exists → use it
  //   if (user.email) {
  //     dbUser = await db.user.upsert({
  //       where: { email: user.email },
  //       update: {
  //         username: user.name ?? undefined,
  //         ProfilePicture: user.image ?? undefined,
  //         lastLogin: new Date(),
  //       },
  //       create: {
  //         email: user.email,
  //         username: user.name ?? "unknown",
  //         ProfilePicture: user.image ?? undefined,
  //         emailVerified: new Date(),
  //         lastLogin: new Date(),
  //       },
  //     })
  //   } else {
  //     // 2. No email → check existing account
  //     const existingAccount = await db.account.findUnique({
  //       where: {
  //         provider_providerAccountId: {
  //           provider: account.provider,
  //           providerAccountId: account.providerAccountId,
  //         },
  //       },
  //       include: { user: true },
  //     })

  //     if (existingAccount) {
  //       dbUser = existingAccount.user
  //     } else {
  //       // 3. Create user WITHOUT email
  //       dbUser = await db.user.create({
  //         data: {
  //           username: user.name ?? "unknown",
  //           ProfilePicture: user.image ?? undefined,
  //           lastLogin: new Date(),
  //         },
  //       })
  //     }
  //   }

  //   // 4. Link OAuth account
  //   await db.account.upsert({
  //     where: {
  //       provider_providerAccountId: {
  //         provider: account.provider,
  //         providerAccountId: account.providerAccountId,
  //       },
  //     },
  //     update: {
  //       userId: dbUser.id,
  //     },
  //     create: {
  //       userId: dbUser.id,
  //       provider: account.provider,
  //       providerAccountId: account.providerAccountId,
  //     },
  //   })

  //   return true
  // } catch (e) {
  //   console.error("[OAuth signIn]", e)
  //   return false
  // }
// }


  // SIGNIN 2 --> This one is better 

// signIn: async ({ user, account }) => {
//   try {
//     if (!account) return false
//     if (account.provider === "credentials") return true

//     // 1. Find existing account (this is the source of truth)
//     const existingAccount = await db.account.findUnique({
//       where: {
//         provider_providerAccountId: {
//           provider: account.provider,
//           providerAccountId: account.providerAccountId,
//         },
//       },
//       include: { user: true },
//     })

//     let dbUser

//     if (existingAccount) {
//       // ✅ Known OAuth identity → use linked user
//       dbUser = existingAccount.user
//     } else {
//       // 2. No account yet → try email ONLY for initial linking
//       if (user.email) {
//         const emailUser = await db.user.findUnique({
//           where: { email: user.email },
//         })

//         if (emailUser) {
//           dbUser = emailUser
//         }
//       }

//       // 3. Still no user → create new one
//       if (!dbUser) {
//         dbUser = await db.user.create({
//           data: {
//             email: user.email ?? null,
//             username: user.name ?? "unknown",
//             ProfilePicture: user.image ?? undefined,
//             emailVerified: user.email ? new Date() : null,
//           },
//         })
//       }

//       // 4. Link OAuth account
//       await db.account.create({
//         data: {
//           userId: dbUser.id,
//           provider: account.provider,
//           providerAccountId: account.providerAccountId,
//         },
//       })
//     }

//     // 5. Update non-identity fields ONLY
//     await db.user.update({
//       where: { id: dbUser.id },
//       data: {
//         lastLogin: new Date(),
//         username: user.name ?? undefined,
//         ProfilePicture: user.image ?? undefined,
//       },
//     })

//     return true
//   } catch (err) {
//     console.error("[OAuth signIn error]", err)
//     return false
//   }
// }


  
          return true
       } catch(err) {
        console.log("[OAuth SignIn Error]", err)
        return false
       }
    },
  },
    providers: [
       CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: {label: 'email',type: 'text',placeholder: 'email'},
          password: {label: 'password', type: 'password', placeholder: 'password'}
        },
         authorize: async (credentials: any) => {
      try {
          if (!credentials) {
            throw new Error("No credentials provided")
          }

          const {email,password} = credentials
  
          const parsedData = SignInSchema.safeParse({email,password})
          if(!parsedData.success) throw new Error('Invalid Credentials. try again !')
            
          const user = await db.user.findUnique({where: {email}})
          if(!user) throw new Error('User not found. Please check your email !')
         
          // if (!user.emailVerified) {
          //   throw new Error("Email not verified. Please check your email.");
          // } 
          
          const isMatch = await bcrypt.compare(password, user.password as string)     
          if(!isMatch) throw new Error('Incorrect password. Try again !!!')
  
          await db.user.update({where: {id: user.id}, data: {lastLogin: new Date()}})
  
          return {id: user.id.toString(), name: user.username, email: user.email}

  //          const user = await db.user.findUnique({ where: { email } })
  // if (!user) throw new Error("User not found")

  // const isMatch = await bcrypt.compare(password, user.password!)
  // if (!isMatch) throw new Error("Incorrect password")

  // // 🔑 ENSURE credentials account exists
  // await db.account.upsert({
  //   where: {
  //     provider_providerAccountId: {
  //       provider: "credentials",
  //       providerAccountId: user.id.toString(),
  //     },
  //   },
  //   update: {},
  //   create: {
  //     provider: "credentials",
  //     providerAccountId: user.id.toString(),
  //     userId: user.id,
  //   },
  // })

  // await db.user.update({
  //   where: { id: user.id },
  //   data: { lastLogin: new Date() },
  // })

  // return {
  //   id: user.id.toString(),
  //   email: user.email,
  //   name: user.username,
  // }
  
  } catch(e) {
    console.error(e)
    if(e instanceof Error) throw new Error(e.message)
    else throw new Error('Something went wrong!!!')
  }
        }
       }) ,
       GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || ""
       }),
       GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
      })
    ],
    session: {
      strategy: 'jwt',
      maxAge: 25 * 24 * 60 * 60
    },
    jwt: {
      secret: process.env.AUTH_SECRET || 'secret',
      maxAge: 7 * 24 * 60 * 60
    },
    pages: {
      signIn: '/signin'
    },
    secret: process.env.AUTH_SECRET || 'secret'
  } satisfies NextAuthOptions;
  
  export const getServerAuthSession = () => getServerSession(authOptions)