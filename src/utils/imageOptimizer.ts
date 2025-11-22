/**
 * 图片优化工具
 */

export interface LazyLoadOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  placeholder?: string
  errorImage?: string
}

const defaultOptions: LazyLoadOptions = {
  root: null,
  rootMargin: '50px',
  threshold: 0.1,
  placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWKoOi9veS4rS4uLjwvdGV4dD48L3N2Zz4=',
  errorImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWKoOi9veWksei0pTwvdGV4dD48L3N2Zz4='
}

/**
 * 图片懒加载类
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null
  private options: LazyLoadOptions
  private loadedImages = new Set<HTMLImageElement>()

  constructor(options: Partial<LazyLoadOptions> = {}) {
    this.options = { ...defaultOptions, ...options }
    this.init()
  }

  private init() {
    if (!('IntersectionObserver' in window)) {
      this.loadAllImages()
      return
    }

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        root: this.options.root,
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      }
    )
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        this.loadImage(img)
        this.observer?.unobserve(img)
      }
    })
  }

  private loadImage(img: HTMLImageElement) {
    if (this.loadedImages.has(img)) return

    const src = img.dataset.src
    if (!src) return

    const imageLoader = new Image()
    
    imageLoader.onload = () => {
      img.src = src
      img.classList.add('loaded')
      this.loadedImages.add(img)
    }

    imageLoader.onerror = () => {
      if (this.options.errorImage) {
        img.src = this.options.errorImage
      }
      img.classList.add('error')
    }

    imageLoader.src = src
  }

  private loadAllImages() {
    const images = document.querySelectorAll('img[data-src]')
    images.forEach(img => this.loadImage(img as HTMLImageElement))
  }

  observe(img: HTMLImageElement) {
    if (!this.observer) {
      this.loadImage(img)
      return
    }

    if (this.options.placeholder && !img.src) {
      img.src = this.options.placeholder
    }

    this.observer.observe(img)
  }

  unobserve(img: HTMLImageElement) {
    this.observer?.unobserve(img)
  }

  destroy() {
    this.observer?.disconnect()
    this.observer = null
    this.loadedImages.clear()
  }
}

/**
 * 图片压缩工具
 */
export class ImageCompressor {
  static async compressFile(
    file: File, 
    options: {
      maxWidth?: number
      maxHeight?: number
      quality?: number
      format?: 'jpeg' | 'png' | 'webp'
    } = {}
  ): Promise<Blob> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'jpeg'
    } = options

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        const { width, height } = this.calculateSize(
          img.width, 
          img.height, 
          maxWidth, 
          maxHeight
        )

        canvas.width = width
        canvas.height = height

        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('图片压缩失败'))
            }
          },
          `image/${format}`,
          quality
        )
      }

      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = URL.createObjectURL(file)
    })
  }

  private static calculateSize(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight }

    if (width <= maxWidth && height <= maxHeight) {
      return { width, height }
    }

    const widthRatio = maxWidth / width
    const heightRatio = maxHeight / height
    const ratio = Math.min(widthRatio, heightRatio)

    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio)
    }
  }
}

/**
 * Vue 3 组合式 API 钩子
 */
export function useImageOptimization() {
  let lazyLoader: LazyImageLoader | null = null

  const initLazyLoading = (options?: Partial<LazyLoadOptions>) => {
    lazyLoader = new LazyImageLoader(options)
    return lazyLoader
  }

  const observeImage = (img: HTMLImageElement) => {
    lazyLoader?.observe(img)
  }

  const unobserveImage = (img: HTMLImageElement) => {
    lazyLoader?.unobserve(img)
  }

  const destroyLazyLoader = () => {
    lazyLoader?.destroy()
    lazyLoader = null
  }

  const compressImage = ImageCompressor.compressFile

  return {
    initLazyLoading,
    observeImage,
    unobserveImage,
    destroyLazyLoader,
    compressImage
  }
}

export const defaultLazyLoader = new LazyImageLoader()
