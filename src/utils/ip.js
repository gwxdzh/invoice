// 获取IP地址和位置信息
export const getIpInfo = async () => {
  try {
    const response = await fetch('https://qifu.baidu.com/ip/local/geo/v1/district')
    const data = await response.json()
    console.log(data)
    if (data.code === 'Success') {
      return {
        ip: data.ip,
        location: `${data.data.country}${data.data.prov}${data.data.city}`,
        isp: data.data.isp
      }
    }
    return {
      ip: '未知',
      location: '未知',
      isp: '未知'
    }
  } catch (error) {
    console.error('获取IP信息失败:', error)
    return {
      ip: '未知',
      location: '未知',
      isp: '未知'
    }
  }
} 