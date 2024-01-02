import momentTimeZone, { Moment } from 'moment-timezone'
import fs from 'fs'

export const getCurrentBeijingTime = (): Moment => {
    // 获取当前系统时间
    const systemTime = momentTimeZone();
    // 转换为北京时区
    const beijingTime = systemTime.tz('Asia/Shanghai');
    return beijingTime
}

export const formatUrlQuery = (url: string, q: Record<string, string>): string => {
    const urlSearchParams = new URLSearchParams(q);
    return `${url}?${urlSearchParams.toString()}`
}

export const writeData = (path: string, data: any) => {
    fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8')
}

export const cleanOldJsonFile = (jsonFilePath: string) => {
    // 检查文件是否存在
    if (fs.existsSync(jsonFilePath + '.*.json')) {
        // 删除旧的JSON文件
        fs.unlinkSync(jsonFilePath + '.*.json')
        console.log('Old JSON file deleted successfully.')
    }
}
