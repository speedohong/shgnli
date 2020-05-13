const cloud = require('wx-server-sdk')

exports.main = async (event, context) => {
  // event.userInfo 是已废弃的保留字段，在此不做展示
  // 获取 OPENID 等微信上下文请使用 cloud.getWXContext()
 const buffer   = await  cloud.openapi.security.imgSecCheck({
    media: {
      contentType: result.tempFilePaths[0],
      value: Buffer
    }
  })
  return buffer
}
