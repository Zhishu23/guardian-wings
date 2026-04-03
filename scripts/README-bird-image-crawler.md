# Bird Image Crawler

这是一个独立脚本，不会接入 `uni-app` 运行时，也不会影响 app 启动。

## 功能

- 读取 `uniCloud-aliyun/database/birds.init_data.json`
- 按鸟类名称和学名到百度图片抓取候选图片
- 下载到 `static/birds/<birdId>/`
- 可选把本地图片路径写回 `birds.init_data.json` 的 `images` 字段
- 输出抓取报告到 `scripts/output/bird-image-crawl-report.json`

## 用法

先只抓图，不写数据库：

```bash
node scripts/bird-image-crawler.js --limit=10 --per-bird=3
```

抓图并把图片路径写回 `birds.init_data.json`：

```bash
node scripts/bird-image-crawler.js --limit=10 --per-bird=3 --write-db
```

只处理一条：

```bash
node scripts/bird-image-crawler.js --bird-id=bird_import_0001 --per-bird=2 --write-db
```

按名称过滤：

```bash
node scripts/bird-image-crawler.js --name=朱鹮 --per-bird=2 --write-db
```

强制重抓已有图片的鸟类：

```bash
node scripts/bird-image-crawler.js --limit=5 --force --write-db
```

## 参数

- `--limit=20` 本次最多处理多少条鸟类
- `--per-bird=3` 每种鸟最多保存几张图
- `--bird-id=...` 只处理指定鸟类
- `--name=...` 按中文名模糊过滤
- `--write-db` 把下载结果写回 `birds.init_data.json`
- `--force` 即使已有本地图片也重新抓取
- `--retry=2` 抓取页面失败时的重试次数
- `--cooldown=300` 每张图下载间隔毫秒数

## 结果说明

- 图片保存到 `static/birds/`
- 数据库字段会写成类似 `/static/birds/bird_import_0001/01.jpg`
- 报告保存到 `scripts/output/bird-image-crawl-report.json`

## 注意

- 百度图片页面结构变化时，脚本可能需要调整正则解析规则。
- 抓到的图片并不保证版权、准确性和可商用性，上线前建议人工抽检。
- 如果你的线上数据已经在 uniCloud 数据库里，写回 `birds.init_data.json` 之后还需要你再执行一次数据导入流程。
