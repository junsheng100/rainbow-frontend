import request, {publicService} from '@/utils/request.ts'
import type {BaseVo, PageResponse} from '@/types/common.ts'


// 壁纸信息接口
export interface Wallpaper {
    id?: number
    startDate: string
    fullStartDate: string
    endDate: string
    url: string
    urlBase: string
    fullUrl?: string
    localPath?: string
    copyright?: string
    copyrightLink?: string
    title?: string
    quiz?: string
    wp?: boolean
    hsh?: string
    drk?: number
    top?: number
    bot?: number
    fileSize?: number
    downloadStatus?: number
    downloadTime?: string
    viewCount?: number
    downloadCount?: number
    isFeatured?: boolean
    createTime?: string
    updateTime?: string
}

// 查询参数接口
export interface WallpaperQueryParams {
    page: number
    size: number
    sortBy?: string
    sortDir?: 'asc' | 'desc'
    keyword?: string
    startDate?: string
    title?: string
}

// 获取壁纸分页列表
export const getWallpaperPage = (params: WallpaperQueryParams) => {
    const vo: BaseVo<Wallpaper> = {
        pageNo: params.page,
        pageSize: params.size,
        data: {
            startDate: params.startDate,
            title: params.title
        }
    }
    return request.post<PageResponse<Wallpaper>>('/wallpaper/page', vo);
}
export const syncWallpaper = () => {
    return request.post('/wallpaper/sync');
}

// 获取壁纸详情
export const getWallpaperDetail = (id: number) => {
    return request.get<Wallpaper>(`/wallpaper/${id}`)
}

// 创建壁纸
export const createWallpaper = (data: Wallpaper) => {
    return request.post<Wallpaper>('/wallpaper', data)
}

// 更新壁纸
export const updateWallpaper = (data: Wallpaper) => {
    return request.post<Wallpaper>('/wallpaper', data)
}

// 删除壁纸
export const deleteWallpaper = (id: number) => {
    return request.delete(`/wallpaper/${id}`)
}

// 设置/取消精选
export const toggleFeatured = (id: number, isFeatured: boolean) => {
    return request.put(`/wallpaper/${id}/featured`, {isFeatured})
}

// 手动触发下载
export const triggerDownload = (id: number) => {
    return request.post(`/wallpaper/${id}/download`)
}

export interface WallpaperResponse {
    id: number
    startDate: string
    fullStartDate: string
    endDate: string
    url: string
    urlBase: string
    fullUrl: string
    localPath: string
    copyright: string
    copyrightLink: string
    title: string
    quiz: string
    wp: boolean
    hsh: string
    drk: boolean
    top: boolean
    bot: boolean
    fileSize: number
    downloadStatus: number
    downloadTime: string
    viewCount: number
    downloadCount: number
    isFeatured: boolean
}

interface ApiResponse<T> {
    code: number
    msg: string
    data: T
}

export class WallpaperApi {

    // 获取今日壁纸
    static async getTodayWallpaper(): Promise<WallpaperResponse> {
        const {data} = await request.get(`/wallpaper/today`)
        return data
    }

    // 获取最新壁纸
    static async getLatestWallpaper(): Promise<WallpaperResponse> {
        const {data} = await request.get(`/wallpaper/latest`)
        return data
    }

    // 获取随机壁纸
    static async getRandomWallpaper(): Promise<WallpaperResponse> {
        const {data} = await request.get(`/wallpaper/random`)
        return data
    }

    // 获取壁纸列表
    static async getWallpapers(params: WallpaperQueryParams): Promise<{
        content: WallpaperResponse[]
        totalElements: number
        totalPages: number
    }> {
        const {data} = await request.get(`/wallpaper/list`, {params})
        return data
    }

    // 获取精选壁纸
    static async getFeaturedWallpapers(limit: number = 8): Promise<WallpaperResponse[]> {
        const {data} = await request.get(`/wallpaper/featured`, {
            params: {limit}
        })
        return data
    }

    // 获取热门壁纸
    static async getPopularWallpapers(limit: number = 8): Promise<WallpaperResponse[]> {
        const {data} = await request.get(`/wallpaper/popular`, {
            params: {limit}
        })
        return data
    }

    // 搜索壁纸
    static async searchWallpapers(keyword: string, page: number = 1, size: number = 10): Promise<{
        content: WallpaperResponse[]
        totalElements: number
        totalPages: number
    }> {
        const {data} = await request.get(`/wallpaper/search`, {
            params: {keyword, page, size}
        })
        return data
    }

    // 增加查看次数
    static async incrementViewCount(id: number): Promise<void> {
        await request.post(`/wallpaper/${id}/view`)
    }

    // 增加下载次数
    static async incrementDownloadCount(id: number): Promise<void> {
        await request.post(`/wallpaper/${id}/download`)
    }

    // 获取壁纸图片URL
    static getImageUrl(path: string, type: 'full' | 'preview' = 'full'): string {
        return `/wallpaper/images/${type}/${path}`
    }

    // 获取今日壁纸（免 token）
    static async getPublicTodayWallpaper(): Promise<WallpaperResponse> {
        const {data} = await publicService.get(`/wallpaper/public/today`)
        return data
    }


    // 获取随机壁纸（免 token）
    static async getPublicRandomWallpaper(): Promise<WallpaperResponse> {
        const response = await publicService.get<ApiResponse<WallpaperResponse>>(`/wallpaper/public/random`)


        // 检查响应结构
        if (response.data.code === 200 && response.data.data) {
            return response.data.data
        }

        throw new Error(response.data.msg || '获取随机壁纸失败：无效的响应数据格式')
    }

    // 获取近期的壁纸（免 token）
    static async getPublicLatestWallpaper(): Promise<WallpaperResponse> {
        const response = await publicService.get<ApiResponse<WallpaperResponse>>(`/wallpaper/public/latest`)

        // 检查响应结构
        if (response.data.code === 200 && response.data.data) {
            return response.data.data
        }

        throw new Error(response.data.msg || '获取随机壁纸失败：无效的响应数据格式')
    }

    // 获取精选壁纸（免 token）
    static async getPublicFeaturedWallpapers(limit: number = 8): Promise<WallpaperResponse[]> {
        const {data} = await publicService.get(`/wallpaper/public/featured`, {
            params: {limit}
        })
        return data
    }
}


