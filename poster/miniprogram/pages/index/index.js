Page({
  data: {
    img: "",
    userInfo: '',
    isPaint: false,
    isOver: false,
    isReset: true
  },
  bindgetuserinfo(res) {
    wx.showLoading({
      title: '海报生成中...',
    })
    this.setData({
      userInfo: res.detail.userInfo,
      isReset: false
    }, () => {
      this.paint(this.data.userInfo, null)
    })

  },
  choose() {
    let that = this
    wx.showLoading({
      title: '海报生成中...',
    })
    wx.chooseImage({
      count: 1,
      sizeType: ["original"],
      sourceType: ["album"],
      success: (result) => {
        that.setData({
          isReset: false,
        }, () => {
          setTimeout(() => {
            that.paint(null, result.tempFilePaths[0])
          }, 500)
        })
        console.log(result.tempFilePaths[0])
      },
    })
  },
  paint(userInfo, tempFilePaths) {
    var modules = wx.getSystemInfoSync()
    console.log(modules)
    if(modules.windowHeight<808){
      modules.windowHeight=808,
      modules.windowWidth=414
    }
    this.setData({
      Height: modules.windowHeight - 50,
      Width: modules.windowWidth,
      isPaint: true,
    })
    if (modules) {
      var that = this
      const query = wx.createSelectorQuery()
      query.select('#canvas')
        .fields({
          node: true,
          size: true
        })
        .exec((res) => {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')

          const dpr = wx.getSystemInfoSync().pixelRatio

          canvas.width = res[0].width * dpr
          canvas.height = res[0].height * dpr
          console.log(res[0].width)
          const img = canvas.createImage()
          const imgava = canvas.createImage()
          ctx.fillStyle = "white"
          ctx.fillRect(0, 0, canvas.width, canvas.height - 50);
          imgava.onload = () => {
            this._imgava = imgava
            ctx.save()
            ctx.beginPath()
            if(tempFilePaths){
              ctx.arc(res[0].width / 2, 210,300, 0, 2 * Math.PI)
              ctx.clip()
              ctx.drawImage(this._imgava, 80, 80, 300, 300)
            }
            else{
              ctx.arc(res[0].width / 2, 210,150, 0, 2 * Math.PI)
              ctx.fill()
              ctx.clip()
              
              ctx.drawImage(this._imgava, 80, 80, 250, 250)
            }
            ctx.restore()
          }
          img.onload = () => {
            this._img = img
            ctx.drawImage(this._img, 0, 0, res[0].width, res[0].height)
            wx.canvasToTempFilePath({
              destWidth: canvas.width,
              destHeight: canvas.height - 50,
              canvas: canvas,
              success(res) {
                wx.hideLoading()
                that.setData({
                  img: res.tempFilePath,
                  isPaint: false,
                  isOver: true
                })
              }
            })
          }
          imgava.src = tempFilePaths || userInfo.avatarUrl
          img.src = '../image/poster.png'
          ctx.scale(dpr, dpr)
        })
    }
  },
  saveImageToPhotosAlbum() {
    let that = this;
    wx.saveImageToPhotosAlbum({
      filePath: this.data.img,
      success(res) {
        wx.showToast({
          title: '保存成功',
          complete: (res) => {
            that.setData({
              isOver: false,
              isReset: true
            })
          }
        })
      },
      fail(){
        wx.showToast({
          title: '保存失败',
          complete: (res) => {
            that.setData({
              isOver: false,
              isReset: true
            })
          }
        })
      }
    })
  }
})