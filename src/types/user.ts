export interface User {
  id: string
  username: string
  password: string
  displayName: string
  avatar: string
  createdAt: number
}

export interface AuthState {
  isLoggedIn: boolean
  currentUser: Omit<User, 'password'> | null
}
