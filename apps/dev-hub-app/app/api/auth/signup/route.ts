import { NextRequest, NextResponse } from 'next/server'
import { createUser, authenticateUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Create user (default role is 'regular')
    const newUser = await createUser(email, password, 'regular', name)

    // Automatically log in the new user
    const result = await authenticateUser(email, password)

    if (!result) {
      return NextResponse.json(
        { error: 'User created but login failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      user: result.user,
      token: result.token,
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Signup failed',
      },
      { status: 500 }
    )
  }
}

