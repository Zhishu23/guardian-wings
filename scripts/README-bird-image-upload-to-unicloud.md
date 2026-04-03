# Upload Bird Images To uniCloud

这个工具是独立脚本，不会参与 app 启动流程。

它做的事情是：

- 读取 `static/birds/<birdId>/` 里的本地图片
- 调用一个 URL 化的 uniCloud 云函数
- 由云函数把图片上传到 uniCloud 云存储
- 同时把 `birds` 集合里的 `images` 更新成云存储 `fileID`
- 最后把本地 `birds.init_data.json` 同步更新成同样的 `fileID`

## 1. 先部署云函数

新云函数目录：

- `uniCloud-aliyun/cloudfunctions/gw-bird-storage-admin`

先打开：

- `uniCloud-aliyun/cloudfunctions/gw-bird-storage-admin/index.js`

把这里改成你自己的强口令：

```js
const CONFIG = {
  uploadToken: 'replace-with-a-strong-token'
}
```

然后把这个云函数上传部署到 uniCloud。

## 2. 给云函数配置 URL 化

按 uniCloud 官方文档，在 uniCloud 控制台给 `gw-bird-storage-admin` 配置一个 HTTP 访问路径。

例如你配置成：

- `/bird-storage-admin`

那么最终会得到一个 URL，形如：

- `https://你的域名/bird-storage-admin`

这个 URL 就是脚本里要用的 `BIRD_UPLOAD_URL`。

参考官方文档：

- [uniCloud 云函数 URL 化](https://doc.dcloud.net.cn/uniCloud/http.html)
- [uniCloud 云存储](https://doc.dcloud.net.cn/uniCloud/storage/dev.html)

## 3. 运行上传脚本

PowerShell 示例：

```powershell
$env:BIRD_UPLOAD_URL="https://你的域名/bird-storage-admin"
$env:BIRD_UPLOAD_TOKEN="你在云函数里设置的强口令"
node scripts/upload-bird-images-to-unicloud.js --limit=126 --per-bird=3
```

只上传一条：

```powershell
$env:BIRD_UPLOAD_URL="https://你的域名/bird-storage-admin"
$env:BIRD_UPLOAD_TOKEN="你在云函数里设置的强口令"
node scripts/upload-bird-images-to-unicloud.js --bird-id=bird_import_0001 --per-bird=3
```

强制覆盖已是云图的记录：

```powershell
$env:BIRD_UPLOAD_URL="https://你的域名/bird-storage-admin"
$env:BIRD_UPLOAD_TOKEN="你在云函数里设置的强口令"
node scripts/upload-bird-images-to-unicloud.js --limit=126 --per-bird=3 --force
```

## 4. 输出

- 上传报告：`scripts/output/bird-image-upload-report.json`
- 本地鸟类数据：`uniCloud-aliyun/database/birds.init_data.json`

## 5. 注意

- 这个脚本要求 `gw-bird-storage-admin` 已经部署并且已经 URL 化。
- 阿里云 URL 化请求体有大小限制，所以脚本默认每种鸟只传 3 张图片。
- 如果某张图片过大，建议先压缩后再上传。
