import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export type UserRole = 'admin' | 'paid' | 'regular'

export interface User {
  id: string
  email: string
  password: string // hashed
  role: UserRole
  name?: string
  createdAt: string
  updatedAt: string
}

const USERS_FILE = join(process.cwd(), 'data', 'users.json')
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

async function readUsers(): Promise<User[]> {
  try {
    const content = await readFile(USERS_FILE, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    // File doesn't exist, return empty array
    return []
  }
}

async function writeUsers(users: User[]): Promise<void> {
  await mkdir(join(process.cwd(), 'data'), { recursive: true })
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8')
}

export async function createUser(
  email: string,
  password: string,
  role: UserRole = 'regular',
  name?: string
): Promise<User> {
  const users = await readUsers()

  // Check if user already exists
  if (users.some((u) => u.email === email)) {
    throw new Error('User with this email already exists')
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    password: hashedPassword,
    role,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  users.push(newUser)
  await writeUsers(users)

  return newUser
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: Omit<User, 'password'>; token: string } | null> {
  const users = await readUsers()
  const user = users.find((u) => u.email === email)

  if (!user) {
    return null
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    return null
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  const { password: _, ...userWithoutPassword } = user

  return { user: userWithoutPassword, token }
}

export async function getUserById(id: string): Promise<Omit<User, 'password'> | null> {
  const users = await readUsers()
  const user = users.find((u) => u.id === id)

  if (!user) {
    return null
  }

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function getUserByEmail(email: string): Promise<Omit<User, 'password'> | null> {
  const users = await readUsers()
  const user = users.find((u) => u.email === email)

  if (!user) {
    return null
  }

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export function verifyToken(token: string): { userId: string; email: string; role: UserRole } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      role: UserRole
    }
    return decoded
  } catch (error) {
    return null
  }
}

export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<Omit<User, 'password'> | null> {
  const users = await readUsers()
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) {
    return null
  }

  users[userIndex].role = newRole
  users[userIndex].updatedAt = new Date().toISOString()

  await writeUsers(users)

  const { password: _, ...userWithoutPassword } = users[userIndex]
  return userWithoutPassword
}

