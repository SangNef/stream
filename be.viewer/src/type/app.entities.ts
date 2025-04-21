import { Request } from "express"
export interface ReqEntity extends Request {
    user: {
        sub: number,
        role: 'creator' | 'user'
    }
}

export interface ConfigModelEntity {
    id?: number
    key: string
    value: string
}

export enum AdminRole {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
}
export interface AdminModelEntity {
    id?: number
    name: string
    email: string
    password: string
    role: AdminRole
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}

export enum UserRole {
    CREATOR = "creator",
    USER = "user",
}
export interface UserModelEntity {
    id?: number
    fullname: string
    username: string
    password: string
    avatar: string | null
    role: UserRole,
    balance: number
    phone: string | null
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}

export enum TransactionType {
    deposit = "deposit",
    withdraw = "withdraw",
}
export enum TransactionStatus {
    pending = "pending",
    success = "success",
    cancel = "cancel",
}
export interface TransactionModelEntity {
    id?: number
    user_id: number
    type: TransactionType
    amount: number
    status: TransactionStatus
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}

export interface AdminActionModelEntity {
    id?: number
    admin_id: number
    action: string
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}

export enum StreamStatus {
    PENDING = "pending",
    LIVE = "live",
    STOP = "stop",
}
export interface StreamModelEntity {
    id?: number
    user_id: number
    thumbnail: string
    stream_url: string
    title: string
    view: number
    status: StreamStatus
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}

export interface CommentModelEntity {
    id?: number
    stream_id: number
    user_id: number
    content: string
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}

export enum NotiModelType {
    FOLLOW = "follow",
    LIVE = "live",
    TRANSACTION = "transaction",
}
export interface NotiModelEntity {
    id?: number
    user_id: number
    type: NotiModelType
    title: string
    content: string
    is_read: boolean
    navigate_to: string
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}

export interface FollowerModelEntity {
    id?: number
    user_id: number
    creator_id: number
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}

export interface DonateItemEntity {
    id?: number
    name: string
    image: string
    price: number
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}

export interface BankModelEntity {
    id?: number
    user_id: number
    bank_name: string
    bank_account: string
    bank_username: string
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}

export interface DonateModelEntity {
    id?: number
    user_id: number
    item_id: number
    stream_id: number
    amount: number
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}