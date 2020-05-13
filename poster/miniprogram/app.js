//app.js
import GlobalConfig from './pages/config/index'
const globalConfig = new GlobalConfig()
App({
  onLaunch: function () {
    
  },
  globalData: {
    config: globalConfig,
  },
})
