import { User as UserServerModel, UserRole } from '../../../../../shared'

export class User implements UserServerModel {
  id: number
  username: string
  email: string
  role: UserRole
  displayNSFW: boolean
  videoQuota: number
  createdAt: Date

  constructor (hash: {
    id: number,
    username: string,
    email: string,
    role: UserRole,
    videoQuota?: number,
    displayNSFW?: boolean,
    createdAt?: Date
  }) {
    this.id = hash.id
    this.username = hash.username
    this.email = hash.email
    this.role = hash.role

    if (hash.videoQuota !== undefined) {
      this.videoQuota = hash.videoQuota
    }

    if (hash.displayNSFW !== undefined) {
      this.displayNSFW = hash.displayNSFW
    }

    if (hash.createdAt !== undefined) {
      this.createdAt = hash.createdAt
    }
  }

  isAdmin () {
    return this.role === 'admin'
  }
}
