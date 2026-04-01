// 路径：uni_modules/uni-id-pages/config.js
export default {
  // 是否自动跳转到登录页（token过期时）
  autoBack: true,

  // 登录方式配置 - 只开启翼路平安需要的方式
  loginTypes: [
    'univerify',   // 手机号一键登录（可选，需开通服务）
    'smsCode',     // 手机号+验证码  ← 公众端主要登录方式
    'pwd',         // 用户名+密码    ← 公众端备用 / 警务端使用
    'weixin'       // 微信登录       ← 公众端微信登录
  ],

  // 同意协议才能登录
  agreements: [
    {
      title: '用户协议',
      url: '/pages/law/index'  // 指向你项目的法律页面
    },
    {
      title: '隐私政策',
      url: '/pages/law/index'
    }
  ],

  // 注册时是否设置密码（公众端手机注册不强制设密码）
  setPasswordAfterLogin: false
}