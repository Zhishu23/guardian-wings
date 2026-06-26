// 保护等级定义
export const PROTECTION_LEVELS = {
  CR: { label: '极危', color: '#E53E3E', bgColor: '#FED7D7' }, // 红色
  EN: { label: '濒危', color: '#DD6B20', bgColor: '#FEEBC8' }, // 橙色
  VU: { label: '易危', color: '#D69E2E', bgColor: '#FAF089' }, // 黄色
  NT: { label: '近危', color: '#38A169', bgColor: '#C6F6D5' }, // 绿色
  LC: { label: '无危', color: '#3182CE', bgColor: '#BEE3F8' }  // 蓝色
}

// 栖息地类型
export const HABITAT_TYPES = {
  wetland: '湿地',
  forest: '森林',
  grassland: '草原',
  mountain: '山地',
  urban: '城市'
}

// 鸟类数据
export default [
  {
    id: 1,
    name: '朱鹮',
    latinName: 'Nipponia nippon',
    protectionLevel: 'CR',
    habitat: 'wetland',
    size: '中型',
    description: '朱鹮被誉为"东方宝石",是国家一级保护动物。体长约55-75厘米,羽色洁白,繁殖期头部、颈部及下背部呈粉红色。',
    distribution: '主要分布在陕西、河南等地的湿地区域',
    habits: '喜栖息于水田、沼泽地带,以小鱼、泥鳅、昆虫等为食。',
    conservation: '全球仅存数千只,中国通过人工繁育和野外放归使种群逐步恢复。',
    image: '/static/birds/zhuhuan.jpg',
    thumbnail: '/static/birds/thumbs/zhuhuan.jpg'
  },
  {
    id: 2,
    name: '丹顶鹤',
    latinName: 'Grus japonensis',
    protectionLevel: 'EN',
    habitat: 'wetland',
    size: '大型',
    description: '丹顶鹤是大型涉禽,国家一级保护动物。体长约120-160厘米,通体洁白,头顶裸露皮肤鲜红色。',
    distribution: '繁殖于中国东北、俄罗斯远东,越冬于长江中下游湿地',
    habits: '栖息于开阔的湿地,以鱼类、水生植物、昆虫为食。',
    conservation: '全球种群约3000只,主要威胁为栖息地丧失。',
    image: '/static/birds/dandinghe.jpg',
    thumbnail: '/static/birds/thumbs/dandinghe.jpg'
  },
  {
    id: 3,
    name: '白鹳',
    latinName: 'Ciconia ciconia',
    protectionLevel: 'EN',
    habitat: 'wetland',
    size: '大型',
    description: '大型涉禽,国家一级保护动物。体长约100-125厘米,羽色白色,飞羽黑色,喙和腿红色。',
    distribution: '繁殖于欧洲、中国东北,越冬于非洲、南亚',
    habits: '栖息于沼泽、湖泊,以鱼类、蛙类、昆虫为食。',
    conservation: '种群数量约50万只,主要保护措施为湿地恢复。',
    image: '/static/birds/baiguan.jpg',
    thumbnail: '/static/birds/thumbs/baiguan.jpg'
  },
  {
    id: 4,
    name: '黑颈鹤',
    latinName: 'Grus nigricollis',
    protectionLevel: 'VU',
    habitat: 'grassland',
    size: '大型',
    description: '世界唯一生活在高原的鹤类,国家一级保护动物。体长约110-120厘米,颈部黑色。',
    distribution: '繁殖于青藏高原,越冬于云贵高原',
    habits: '栖息于高原湖泊、沼泽,以植物块茎、昆虫为食。',
    conservation: '全球种群约1.5万只,主要威胁为栖息地退化。',
    image: '/static/birds/heijinghe.jpg',
    thumbnail: '/static/birds/thumbs/heijinghe.jpg'
  },
  {
    id: 5,
    name: '东方白鹳',
    latinName: 'Ciconia boyciana',
    protectionLevel: 'EN',
    habitat: 'wetland',
    size: '大型',
    description: '大型涉禽,国家一级保护动物。体长约100-129厘米,羽色白色,飞羽黑色。',
    distribution: '繁殖于中国东北、俄罗斯远东,越冬于长江流域',
    habits: '栖息于沼泽、河流,以鱼类为主食。',
    conservation: '全球种群约9000只,中国是最重要的越冬地。',
    image: '/static/birds/dongfangbaiguan.jpg',
    thumbnail: '/static/birds/thumbs/dongfangbaiguan.jpg'
  },
  {
    id: 6,
    name: '白琵鹭',
    latinName: 'Platalea leucorodia',
    protectionLevel: 'LC',
    habitat: 'wetland',
    size: '中型',
    description: '中型涉禽,国家二级保护动物。体长约70-95厘米,羽色纯白,喙呈琵琶状。',
    distribution: '分布广泛,繁殖于欧亚大陆,越冬于非洲、南亚',
    habits: '栖息于浅水湿地,以小鱼、虾、昆虫为食。',
    conservation: '种群稳定,约25万只。',
    image: '/static/birds/baipilu.jpg',
    thumbnail: '/static/birds/thumbs/baipilu.jpg'
  },
  {
    id: 7,
    name: '灰鹤',
    latinName: 'Grus grus',
    protectionLevel: 'LC',
    habitat: 'wetland',
    size: '大型',
    description: '大型涉禽,国家二级保护动物。体长约100-130厘米,羽色灰色。',
    distribution: '繁殖于欧亚大陆北部,越冬于南欧、北非、南亚',
    habits: '栖息于开阔湿地,以植物种子、昆虫为食。',
    conservation: '种群数量约60万只,种群稳定。',
    image: '/static/birds/huihe.jpg',
    thumbnail: '/static/birds/thumbs/huihe.jpg'
  },
  {
    id: 8,
    name: '白头鹤',
    latinName: 'Grus monacha',
    protectionLevel: 'VU',
    habitat: 'wetland',
    size: '大型',
    description: '大型涉禽,国家一级保护动物。体长约100厘米,头部白色。',
    distribution: '繁殖于西伯利亚,越冬于日本、朝鲜半岛',
    habits: '栖息于沼泽、湿地,以植物种子、水生植物为食。',
    conservation: '全球种群约1.3万只。',
    image: '/static/birds/baitouhe.jpg',
    thumbnail: '/static/birds/thumbs/baitouhe.jpg'
  }
]

// 热门鸟类ID列表
export const HOT_BIRDS = [1, 2, 3, 4, 5, 6]

// 搜索过滤函数
export function searchBirds(keyword, birdsList) {
  if (!keyword) return birdsList
  
  const lowerKeyword = keyword.toLowerCase()
  return birdsList.filter(bird => 
    bird.name.toLowerCase().includes(lowerKeyword) ||
    bird.latinName.toLowerCase().includes(lowerKeyword) ||
    bird.description.includes(keyword)
  )
}

// 按保护等级过滤
export function filterByLevel(level, birdsList) {
  if (!level) return birdsList
  return birdsList.filter(bird => bird.protectionLevel === level)
}

// 按栖息地过滤
export function filterByHabitat(habitat, birdsList) {
  if (!habitat) return birdsList
  return birdsList.filter(bird => bird.habitat === habitat)
}