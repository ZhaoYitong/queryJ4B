import axios from "axios"
import path from "path"
import lodash, { result } from "lodash"
import { writeData, getCurrentBeijingTime } from "./util"

const currentDate = getCurrentBeijingTime().format('YYYYMMDD')
const relativePath = path.join(__dirname, 'output', `alljobs_${currentDate}.json`)

// const queryParam = {
//     city: 101190400,
//     experience: '',
//     payType: '',
//     partTime: '',
//     degree: '',
//     industry: '',
//     scale: '',
//     salary: 406, // 20 - 50 k
//     jobType: 1901, // 全职
//     encryptExpectId: '',
//     mixExpectType: '',
//     page: 1,
//     pageSize: 15
// }


const cityCode: {
    [key: string]: string
} = {
    '101190400': '101190400', // 苏州 // 不考虑，岗位太少，可达到20k的公司数太少
    '101210100': '101210100', // 杭州 
    '101010100': '101010100', // 北京 // 最次选择，北方环境不合适
    '101020100': '101020100', // 上海
    '101280600': '101280600', // 深圳 // 备选，环境不合适
}

const cityNameMap: {
    [key: string]: string
} = {
    '101190400': '苏州',
    '101210100': '杭州',
    '101010100': '北京',
    '101020100': '上海',
    '101280600': '深圳',
}

const getConfig = (page: number, cityCode: string) => {
    console.log(`Fetching page ${page} of city ${cityCode}`)
    return {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://www.zhipin.com/wapi/zpgeek/search/joblist.json?scene=1&query=%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91%E5%B7%A5%E7%A8%8B%E5%B8%88&city=101210100&experience=&payType=&partTime=&degree=&industry=&scale=303,304,305,306&stage=&position=&jobType=1901&salary=406&multiBusinessDistrict=&multiSubway=&page=${page}&pageSize=30`,
        headers: { 
          'Cookie': 'lastCity=101190400; wd_guid=7a1dea97-6898-48cc-881a-05e1721f3d51; historyState=state; wt2=DAwp0r7gehM7oZwjsgGwJODe4kRio_CwB6UbPPQWSq_7nfvwWTRgva3cftjRaYIlXf6lhM4KYXtwglD26NCNdZw~~; wbg=0; _bl_uid=IRlRhqsnuFvydkgzmxReed28IymI; __fid=763145271c6220be551541c2091d973a; sid=sem_pz_bdpc_dasou_title; Hm_lvt_194df3105ad7148dcf2b98a91b5e727a=1704115549,1704174802; __zp_seo_uuid__=69525a7d-35e5-4712-bb50-f22802309bc9; __l=r=https%3A%2F%2Fwww.zhipin.com%2Fweb%2Fcommon%2Fsecurity-check.html%3Fseed%3DtyJ3yRpfebQnnLYcdeerBGCWc4Q5CAwpVdoPgtDJoIQ%253D%26name%3D1ffa88d7%26ts%3D1704174803244%26callbackUrl%3Dhttps%253A%252F%252Fwww.zhipin.com%252Fsuzhou%252F%253Fsid%253Dsem_pz_bdpc_dasou_title&l=%2Fcitysite%2Fsuzhou%2F%3Fsid%3Dsem_pz_bdpc_dasou_title&s=1; Hm_lpvt_194df3105ad7148dcf2b98a91b5e727a=1704174805; __g=sem_pz_bdpc_dasou_title; __zp_stoken__=4ddafw4vDvcOyFj4TWmNpFFfCvWvCicK%2FZVDDgUvCul7CtMOBTE3Cqk7CrMOBwp55w4Jgwr9iwqRVWcKzwr3DiMKMeMKnVMKhw4bDu8K4w61dwqBdwp%2FEoMSIw73EsMKEwpjCvcKaOjUQDxYLDBEOFwoNfXoOExQQDxYLDBgXDhMUPznEhMSJeUE%2FO0EwU1RND1RiZlRiUAxgVU4%2BPmALWw0%2BM0RBPjrDhMOEwr1Gw4PCvcOIScOHwrrDgQxBRjo9w4cfKy1QGMK6Qg5xGMOBwosOwr3Ciw3DjmXCsMKbLcK8wpI5RjvCvsS7QkcfSEE%2BPTo9Qj5HLz1fw41bwqzCqS7Cv8O3Kj4hRkc6RD8%2BRzpCQUQzOkYcLEdBLkUWFxIYDi86wr1cwrrDoEc6; __c=1704174802; __a=41200642.1704115549.1704115549.1704174802.20.2.6.6; geek_zp_token=V1R9smGOz_3V1gXdJpyxwfLC-26z7TxA~~; __zp_sname__=1ffa88d7; __zp_sseed__=tyJ3yRpfebQnnLYcdeerBM5TLIHs/p5Ym46jkSfMTEM=; __zp_sts__=1704175149701'
        }
    }
}

const getJobsByCity = async (cityCode: number): Promise<any[]> => {
    let initList: any[] = [];
    let currentPage = 1;
    while (true) {
        const config = getConfig(currentPage, String(cityCode));
        const res = await axios.request(config);
        console.log(res.data)
        if (res.data?.zpData.hasMore) {
            // 如果有更多数据，将当前页的数据添加到列表中
            initList = initList.concat(res.data.zpData.jobList);
            currentPage++;
        } else {
            // 如果没有更多数据，将最后一页的数据添加到列表中并跳出循环
            initList = initList.concat(res.data.zpData.jobList);
            break;
        }
    }
    const filtered = initList.filter((item) => {
        return item.jobName.includes('前端') || item.jobName.includes('web') || item.jobName.includes('Web')
    })
    console.log(`Total ${filtered.length} jobs found .`)
    writeData(relativePath, filtered)
    return filtered
}

getJobsByCity(101210100)

// let initList: any[] = []
// let results: any[] = []
// Promise.all(Object.keys(cityCode).map((key) => {
//     return getJobsByCity(key as any)
// })).then((res) => {
//     res.forEach((item) => {
//         initList = initList.concat(item)
//     })
//     Object.keys(cityNameMap).forEach((key) => {
//         results = results.concat([{
//             id: key,
//             name: cityNameMap[key],
//             jobs: []
//         }])
//     })
//     initList.map((item) => {
//         const cityIndex = lodash.findIndex(results, (o) => {
//             return o.id === item.city
//         })
//         console.log(cityIndex)
//         // results[cityIndex].jobs.push(item)
//     })
//     writeData(relativePath, initList)
// })
