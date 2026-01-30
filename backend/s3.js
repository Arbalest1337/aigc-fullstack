const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const fs = require('fs')
const path = require('path')

// 1. 配置 Cloudflare R2 客户端
const r2Client = new S3Client({
  region: 'auto',
  endpoint: ``,
  credentials: {
    accessKeyId: '',
    secretAccessKey: ''
  }
})

async function uploadToR2(localFilePath, bucketName, r2Path) {
  try {
    // 检查本地文件是否存在
    if (!fs.existsSync(localFilePath)) {
      throw new Error('本地文件不存在')
    }

    const fileStream = fs.createReadStream(localFilePath)
    const fileName = path.basename(localFilePath)

    // 1. 处理 r2Path，确保它不以 / 开头
    let cleanPath = r2Path.startsWith('/') ? r2Path.slice(1) : r2Path

    // 2. 拼接路径
    // 如果 cleanPath 为空（根目录），直接用文件名；否则拼接
    const destinationKey =
      cleanPath === '' ? fileName : cleanPath.endsWith('/') ? `${cleanPath}${fileName}` : cleanPath

    // 2. 构建上传指令
    const uploadParams = {
      Bucket: bucketName,
      Key: destinationKey, // R2 中的指定目录及文件名
      Body: fileStream
      // 如果需要设置文件类型，可以手动添加 ContentType
      // ContentType: "image/png"
    }

    console.log(`正在上传 ${fileName} 到 R2 的 ${destinationKey}...`)

    // 3. 执行上传
    const result = await r2Client.send(new PutObjectCommand(uploadParams))

    console.log('✅ 上传成功:', result)
    return result
  } catch (err) {
    console.error('❌ 上传失败:', err)
  }
}

// 使用示例
const config = {
  localFile: './tiktokZnN3liQ6iFoF50mQRG2v5XpvroD4MKGh.txt',
  bucket: 'funai-staging-media',
  remoteDirectory: '' // 指定 R2 下的目录结构
}

uploadToR2(config.localFile, config.bucket, config.remoteDirectory)
