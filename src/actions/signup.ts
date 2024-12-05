'use server'

import { SignUpSchema } from "~/lib/zod"
import bcrypt from 'bcrypt'
import { db } from "~/server/db"
import { z } from 'zod'

type formData = z.infer<typeof SignUpSchema>

export async function signup(formData: formData) {
 try {
    const parsedData = SignUpSchema.safeParse(formData)
    if(!parsedData.success) return {success: false, errors: parsedData.error.flatten().fieldErrors, msg: 'Invalid inputs'}
    const {username, email, password} = parsedData.data

    const userExists = await db.user.findFirst({where: {OR: [{email}, {username}]}})
    if(userExists) return {success: false, msg: 'user already exists'}

    const hashedPassword = await bcrypt.hash(password,10)
    await db.user.create({data: {username,email,password: hashedPassword}})

    return {success: true, msg: 'Signed up successfully. Welcome to GitChat !!!'}
} catch(e) {
    console.error('Error while signing up',e)
    return {success: false, msg: 'Something went wrong !!!'}
 }

}