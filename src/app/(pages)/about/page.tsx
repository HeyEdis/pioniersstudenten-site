'use client'

import { authClient } from "@/lib/auth-client"

export default function Evenementen() {
  const email = "admin@example.com"
  const password = "password123"

  async function signIn() {
    await authClient.signIn.email({
      email: email,
      password: password
    })
  }

  console.log("authClient log:" + JSON.stringify(authClient.useSession()));

  return <button onClick={signIn}>sign in</button>
}