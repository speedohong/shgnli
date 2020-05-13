import WeCropper from '../../we-cropper/we-cropper.js'

const app = getApp()
const config = app.globalData.config

const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight-50
Page({
    data: {
        statusBarHeight:"",
        buttonClicked:false,
        cropperOpt: {
            id: 'cropper',
            targetId: 'targetCropper',
            pixelRatio: device.pixelRatio,
            width,
            height,
            scale: 2.5,
            zoom: 8,
            cut: {
                x: (width - 300) / 2,
                y: (height - 300) / 2,
                width: 300,
                height: 300
            },
            boundStyle: {
                color: config.getThemeColor(),
                mask: 'rgba(0,0,0,0.8)',
                lineWidth: 1
            }
        }
    },
    touchStart(e) {
        this.cropper.touchStart(e)
    },
    touchMove(e) {
        this.cropper.touchMove(e)
    },
    touchEnd(e) {
        this.cropper.touchEnd(e)
    },
    getCropperImage() {
        this.setData({
            buttonClicked:true
        })
        this.cropper.getCropperImage(function(path, err) {
            if (err) {
              wx.showModal({
                title: '温馨提示',
                content: err.message
              })
            } else {
                console.log('path',path)
                let pages = getCurrentPages();
                let prevPage = pages[pages.length - 2];
                prevPage.setData({
                    headerUrl:path,
                    isCutOver:true
                })
                wx.navigateBack({
                    delta:1
                })

            }
        })
    },
    back() {
      wx.navigateBack({
        delta:1
      })
    },
    onLoad(option) {
        wx.getSystemInfo({
            success:(res)=>{
                this.setData({
                    statusBarHeight:res.statusBarHeight
                })
                
            }
        })
       
        const {
            cropperOpt
        } = this.data

        cropperOpt.boundStyle.color = config.getThemeColor()

        this.setData({
            cropperOpt
        })

        if (option.src) {
            cropperOpt.src = option.src
            this.cropper = new WeCropper(cropperOpt)
                .on('ready', (ctx) => {
                    console.log(`wecropper is ready for work!`)
                })
                .on('beforeImageLoad', (ctx) => {
                    console.log(`before picture loaded, i can do something`)
                    console.log(`current canvas context:`, ctx)
                    wx.showToast({
                        title: '上传中',
                        icon: 'loading',
                        duration: 20000
                    })
                })
                .on('imageLoad', (ctx) => {
                    console.log(`picture loaded`)
                    console.log(`current canvas context:`, ctx)
                    wx.hideToast()
                })
                .on('beforeDraw', (ctx, instance) => {
                    console.log(`before canvas draw,i can do something`)
                    console.log(`current canvas context:`, ctx)
                })
        }
    }
})