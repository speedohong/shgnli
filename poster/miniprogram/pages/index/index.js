wx.cloud.init({
  env: "lishixi-e9c866"
})

Page({
  data: {
    img: "",
    userInfo: '',
    isPaint: false,
    isOver: false,
    isReset: true,
    headerUrl: '',
    isCutOver: false
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
      },
      fail() {
        wx.showToast({
          title: '生成失败',
          complete: (res) => {
            wx.hideLoading()
          },
        })
      }
    })
  },
  paint(userInfo, tempFilePaths) {
    var modules = wx.getSystemInfoSync()
    console.log(modules)
    if (modules.windowHeight < 808) {
      modules.windowHeight = 808,
        modules.windowWidth = 414
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
            // if(tempFilePaths){
            // ctx.arc(res[0].width / 2, 210,300, 0, 2 * Math.PI)
            // ctx.clip()
            // ctx.drawImage(this._imgava, 80, 80, 300, 300)
            // }
            // else{
            // ctx.arc(res[0].width / 2, 210,150, 0, 2 * Math.PI)
            // ctx.fill()
            // ctx.clip()
            console.log(tempFilePaths)
            ctx.drawImage(this._imgava, (res[0].width / 2) - 125, 90, 250, 250)
            // }
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
      fail() {
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
  },
  choose2() {
    var that = this;

    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths
        
      }
    })
  },
  cutButton() {
    wx.showLoading({
      title: '海报生成中...',
    })
    let that = this;
    that.setData({
      isReset: false,
      isCutOver: false,
    }, () => {
      setTimeout(() => {
        that.paint(null, this.data.headerUrl)
      }, 500)
    })

  },
  onShareAppMessage: function (res) {

  },
  checkImg() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })
        console.log(res)
        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            wx.cloud.downloadFile({
              fileID: res.fileID
            }).then(uploadFile => {
              console.log(uploadFile)
              var d = Date.now()
              wx.serviceMarket.invokeService({
                service: 'wxee446d7507c68b11',
                api: 'imgSecCheck',
                data: {
                  "Action": "ImageModeration",
                  "Scenes": ["PORN", "POLITICS", "TERRORISM", "TEXT"],
                  "ImageUrl": uploadFile.tempFilePath,
                  "ImageBase64": "",
                  "Config": "",
                  "Extra": ""
                },
              }).then(res => {
                console.log(JSON.stringify(res))
                wx.showModal({
                  title: 'cost',
                  content: (Date.now() - d) + ' ',
                })
              })
              // wx.cloud.callFunction({
              //   name: 'checkImg',
              //   data: {
              //     imageData: uploadFile.tempFilePath
              //   },
              //   success: res => {
              //     console.log(res, "result")
              //   },
              //   fail: err => {
              //     console.error('[云函数] [login] 调用失败', err)
              //   }
              // })
            }).catch(error => {
              // handle error
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
  doImgSecCheck: function (images) {
    wx.compressImage({
      src: images, // 图片路径
      quality: 50, // 压缩质量
      success(res) {
        console.log(res.tempFilePath)
        wx.getFileSystemManager().readFile({
          filePath: res.tempFilePath,
          encoding: "base64",
          success: function (res) {
            var d = Date.now()
            wx.serviceMarket.invokeService({
              service: 'wxee446d7507c68b11',
              api: 'imgSecCheck',
              data: {
                "Action": "ImageModeration",
                "Scenes": ["PORN", "POLITICS", "TERRORISM", "TEXT"],
                "ImageUrl":new wx.serviceMarket.CDN({
                  type: 'filePath',
                  filePath: res.tempFilePath,
                }),
              },
            }).then(res => {
              console.log(res.data.Response.Suggestion)
            })
          }
        });
        
      }
    })

  },
  checkImg(){
    wx.chooseImage({
      count: 1,
      success: async function(res) {
        const tempFilePaths = res.tempFilePaths
        try {
          wx.serviceMarket.invokeService({
            service: 'wxee446d7507c68b11',
            api: 'imgSecCheck',
            data: {
              "Action": "ImageModeration",
              "Scenes": ["PORN", "POLITICS", "TERRORISM", "TEXT"],
              "ImageUrl": new wx.serviceMarket.CDN({ type: 'filePath', filePath: res.tempFilePaths[0]})
            },
          }).then(res => {
            console.log(res.data.Response.Suggestion)
            let types=res.data.Response.Suggestion
            if(types=="PASS"){
              
              wx.navigateTo({
                url: `./upload/upload?src=${tempFilePaths[0]}`,
              })
            }else{
              wx.showModal({
                title: '检测失败',
                content: "请选择合法图片",
              })
            }
          })
    
        } catch (err) {
          console.error('invokeService fail', err)
          wx.showModal({
            title: 'fail',
            content: err,
          })
        }
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  }
})