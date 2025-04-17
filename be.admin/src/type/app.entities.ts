import { Request } from "express"
export interface ReqEntity extends Request {
    user: {
        sub: number,
        role: 'admin' | 'user'
    }
}

export interface ConfigModelEntity {
    id?: number
    key: string
    value: string
}

export interface AdminModelEntity {
    id?: number
    name: string
    email: string
    password: string
    is_root: boolean
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}

export interface UserModelEntity {
    id?: number
    fullname: string
    username: string
    password: string
    avatar: string | null
    role: 'user' | 'creator',
    coin: number
    phone: string | null
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}

export interface TransactionModelEntity {
    id?: number
    implementer: number
    receiver: number
    type: 'recharge' | 'donate' | 'withdraw'
    is_success: boolean
    is_cancel: boolean
    value: string
    content: string
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}

export interface AdminHistoryModelEntity {
    id?: number
    admin_id: number
    action: 'get' | 'post' | 'put' | 'delete' | 'restore'
    model: string
    data_input: string
    init_value: string | null
    change_value: string
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}

export interface StreamModelEntity {
    id?: number
    user_id: number
    thumbnail: string
    stream_url: string
    title: string
    start_time: Date
    end_time: Date | null
    view: number
    status: 'live' | 'stop' | 'delete' | 'restore' // restore không cần thiết.
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

export interface FavouriteModelEntity {
    id?: number
    stream_id: number
    user_id: number
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}

export interface NotiModelEntity {
    id?: number
    user_id: number
    type: 'live' | 'coin'
    title: string
    content: string
    is_read: boolean
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}

export interface FollowerModelEntity {
    id?: number
    user_id: number
    follower_id: number
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