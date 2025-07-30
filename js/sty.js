
(() => {
  
  const saveToLocal = {
      set: (key, value, ttl) => {
          if (!ttl) return
          const expiry = Date.now() + ttl * 86400000
          localStorage.setItem(key, JSON.stringify({
              value,
              expiry
          }))
      },
      get: key => {
          const itemStr = localStorage.getItem(key)
          if (!itemStr) return undefined
          const {
              value,
              expiry
          } = JSON.parse(itemStr)
          if (Date.now() > expiry) {
              localStorage.removeItem(key)
              return undefined
          }
          return value
      }
  };

  window.btf = {
      saveToLocal,
      getScript: (url, attr = {}) => new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = url
          script.async = true
          Object.entries(attr).forEach(([key, val]) => script.setAttribute(key, val))
          script.onload = script.onreadystatechange = () => {
              if (!script.readyState || /loaded|complete/.test(script.readyState)) resolve()
          }
          script.onerror = reject
          document.head.appendChild(script)
      }),
      getCSS: (url, id) => new Promise((resolve, reject) => {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = url
          if (id) link.id = id
          link.onload = link.onreadystatechange = () => {
              if (!link.readyState || /loaded|complete/.test(link.readyState)) resolve()
          }
          link.onerror = reject
          document.head.appendChild(link)
      }),
      addGlobalFn: (key, fn, name = false, parent = window) => {
          if (!false && key.startsWith('pjax')) return
          const globalFn = parent.globalFn || {}
          globalFn[key] = globalFn[key] || {}
          globalFn[key][name || Object.keys(globalFn[key]).length] = fn
          parent.globalFn = globalFn
      }
  }


  const activateDarkMode = () => {
      document.documentElement.setAttribute('data-theme', 'dark')
      if (document.querySelector('meta[name="theme-color"]') !== null) {
          document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0d0d0d')
      }
  }
  const activateLightMode = () => {
      document.documentElement.setAttribute('data-theme', 'light')
      if (document.querySelector('meta[name="theme-color"]') !== null) {
          document.querySelector('meta[name="theme-color"]').setAttribute('content', '#ffffff')
      }
  }

  btf.activateDarkMode = activateDarkMode
  btf.activateLightMode = activateLightMode

  const theme = saveToLocal.get('theme')

  activateDarkMode();


  const asideStatus = saveToLocal.get('aside-status')
  if (asideStatus !== undefined) {
      document.documentElement.classList.toggle('hide-aside', asideStatus === 'hide')
  }


  const detectApple = () => {
      if (/iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent)) {
          document.documentElement.classList.add('apple')
      }
  }
  detectApple();

  const GLOBAL_CONFIG = {
      root: '/',
      algolia: undefined,
      localSearch: undefined,
      translate: undefined,
      highlight: {
          "plugin": "highlight.js",
          "highlightCopy": true,
          "highlightLang": true,
          "highlightHeightLimit": false,
          "highlightFullpage": false,
          "highlightMacStyle": false
      },
      copy: {
          success: '复制成功',
          error: '复制失败',
          noSupport: '浏览器不支持'
      },
      relativeDate: {
          homepage: false,
          post: false
      },
      runtime: '',
      dateSuffix: {
          just: '刚刚',
          min: '分钟前',
          hour: '小时前',
          day: '天前',
          month: '个月前'
      },
      copyright: undefined,
      lightbox: 'null',
      Snackbar: undefined,
      infinitegrid: {
          js: 'https://cdn.jsdelivr.net/npm/@egjs/infinitegrid/dist/infinitegrid.min.js',
          buttonText: '加载更多'
      },
      isPhotoFigcaption: false,
      islazyloadPlugin: false,
      isAnchor: false,
      percent: {
          toc: true,
          rightside: false,
      },
      autoDarkmode: false
    }
    var GLOBAL_CONFIG_SITE = {
      title: '打包地',
      isHighlightShrink: false,
      isToc: false,
      pageType: 'home'
    }

    const btfFn = {
      debounce: (func, wait = 0, immediate = false) => {
        let timeout
        return (...args) => {
          const later = () => {
            timeout = null
            if (!immediate) func(...args)
          }
          const callNow = immediate && !timeout
          clearTimeout(timeout)
          timeout = setTimeout(later, wait)
          if (callNow) func(...args)
        }
      },
  
      throttle: function (func, wait, options = {}) {
        let timeout, context, args
        let previous = 0
  
        const later = () => {
          previous = options.leading === false ? 0 : new Date().getTime()
          timeout = null
          func.apply(context, args)
          if (!timeout) context = args = null
        }
  
        const throttled = (...params) => {
          const now = new Date().getTime()
          if (!previous && options.leading === false) previous = now
          const remaining = wait - (now - previous)
          context = this
          args = params
          if (remaining <= 0 || remaining > wait) {
            if (timeout) {
              clearTimeout(timeout)
              timeout = null
            }
            previous = now
            func.apply(context, args)
            if (!timeout) context = args = null
          } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining)
          }
        }
  
        return throttled
      },
  
      overflowPaddingR: {
        add: () => {
          const paddingRight = window.innerWidth - document.body.clientWidth
  
          if (paddingRight > 0) {
            document.body.style.paddingRight = `${paddingRight}px`
            document.body.style.overflow = 'hidden'
            const menuElement = document.querySelector('#page-header.nav-fixed #menus')
            if (menuElement) {
              menuElement.style.paddingRight = `${paddingRight}px`
            }
          }
        },
        remove: () => {
          document.body.style.paddingRight = ''
          document.body.style.overflow = ''
          const menuElement = document.querySelector('#page-header.nav-fixed #menus')
          if (menuElement) {
            menuElement.style.paddingRight = ''
          }
        }
      },
  
      snackbarShow: (text, showAction = false, duration = 2000) => {
        const { position, bgLight, bgDark } = GLOBAL_CONFIG.Snackbar
        const bg = document.documentElement.getAttribute('data-theme') === 'light' ? bgLight : bgDark
        Snackbar.show({
          text,
          backgroundColor: bg,
          showAction,
          duration,
          pos: position,
          customClass: 'snackbar-css'
        })
      },
  
      diffDate: (inputDate, more = false) => {
        const dateNow = new Date()
        const datePost = new Date(inputDate)
        const diffMs = dateNow - datePost
        const diffSec = diffMs / 1000
        const diffMin = diffSec / 60
        const diffHour = diffMin / 60
        const diffDay = diffHour / 24
        const diffMonth = diffDay / 30
        const { dateSuffix } = GLOBAL_CONFIG
  
        if (!more) return Math.floor(diffDay)
  
        if (diffMonth > 12) return datePost.toISOString().slice(0, 10)
        if (diffMonth >= 1) return `${Math.floor(diffMonth)} ${dateSuffix.month}`
        if (diffDay >= 1) return `${Math.floor(diffDay)} ${dateSuffix.day}`
        if (diffHour >= 1) return `${Math.floor(diffHour)} ${dateSuffix.hour}`
        if (diffMin >= 1) return `${Math.floor(diffMin)} ${dateSuffix.min}`
        return dateSuffix.just
      },
  
      loadComment: (dom, callback) => {
        if ('IntersectionObserver' in window) {
          const observerItem = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
              callback()
              observerItem.disconnect()
            }
          }, { threshold: [0] })
          observerItem.observe(dom)
        } else {
          callback()
        }
      },
  
      scrollToDest: (pos, time = 500) => {
        const currentPos = window.scrollY
        const isNavFixed = document.getElementById('page-header').classList.contains('fixed')
        if (currentPos > pos || isNavFixed) pos = pos - 70
  
        if ('scrollBehavior' in document.documentElement.style) {
          window.scrollTo({
            top: pos,
            behavior: 'smooth'
          })
          return
        }
  
        const startTime = performance.now()
        const animate = currentTime => {
          const timeElapsed = currentTime - startTime
          const progress = Math.min(timeElapsed / time, 1)
          window.scrollTo(0, currentPos + (pos - currentPos) * progress)
          if (progress < 1) {
            requestAnimationFrame(animate)
          }
        }
        requestAnimationFrame(animate)
      },
  
      animateIn: (ele, animation) => {
        ele.style.display = 'block'
        ele.style.animation = animation
      },
  
      animateOut: (ele, animation) => {
        const handleAnimationEnd = () => {
          ele.style.display = ''
          ele.style.animation = ''
          ele.removeEventListener('animationend', handleAnimationEnd)
        }
        ele.addEventListener('animationend', handleAnimationEnd)
        ele.style.animation = animation
      },
  
      wrap: (selector, eleType, options) => {
        const createEle = document.createElement(eleType)
        for (const [key, value] of Object.entries(options)) {
          createEle.setAttribute(key, value)
        }
        selector.parentNode.insertBefore(createEle, selector)
        createEle.appendChild(selector)
      },
  
      isHidden: ele => ele.offsetHeight === 0 && ele.offsetWidth === 0,
  
      getEleTop: ele => {
        let actualTop = ele.offsetTop
        let current = ele.offsetParent
  
        while (current !== null) {
          actualTop += current.offsetTop
          current = current.offsetParent
        }
  
        return actualTop
      },
  
      loadLightbox: ele => {
        const service = GLOBAL_CONFIG.lightbox
  
        if (service === 'medium_zoom') {
          mediumZoom(ele, { background: 'var(--zoom-bg)' })
        }
  
        if (service === 'fancybox') {
          Array.from(ele).forEach(i => {
            if (i.parentNode.tagName !== 'A') {
              const dataSrc = i.dataset.lazySrc || i.src
              const dataCaption = i.title || i.alt || ''
              btf.wrap(i, 'a', { href: dataSrc, 'data-fancybox': 'gallery', 'data-caption': dataCaption, 'data-thumb': dataSrc })
            }
          })
  
          if (!window.fancyboxRun) {
            Fancybox.bind('[data-fancybox]', {
              Hash: false,
              Thumbs: {
                showOnStart: false
              },
              Images: {
                Panzoom: {
                  maxScale: 4
                }
              },
              Carousel: {
                transition: 'slide'
              },
              Toolbar: {
                display: {
                  left: ['infobar'],
                  middle: [
                    'zoomIn',
                    'zoomOut',
                    'toggle1to1',
                    'rotateCCW',
                    'rotateCW',
                    'flipX',
                    'flipY'
                  ],
                  right: ['slideshow', 'thumbs', 'close']
                }
              }
            })
            window.fancyboxRun = true
          }
        }
      },
  
      setLoading: {
        add: ele => {
          const html = `
          <div class="loading-container">
            <div class="loading-item">
              <div></div><div></div><div></div><div></div><div></div>
            </div>
          </div>
        `
          ele.insertAdjacentHTML('afterend', html)
        },
        remove: ele => {
          ele.nextElementSibling.remove()
        }
      },
  
      updateAnchor: anchor => {
        if (anchor !== window.location.hash) {
          if (!anchor) anchor = location.pathname
          const title = GLOBAL_CONFIG_SITE.title
          window.history.replaceState({
            url: location.href,
            title
          }, title, anchor)
        }
      },
  
      getScrollPercent: (() => {
        let docHeight, winHeight, headerHeight, contentMath
  
        return (currentTop, ele) => {
          if (!docHeight || ele.clientHeight !== docHeight) {
            docHeight = ele.clientHeight
            winHeight = window.innerHeight
            headerHeight = ele.offsetTop
            contentMath = Math.max(docHeight - winHeight, document.documentElement.scrollHeight - winHeight)
          }
  
          const scrollPercent = (currentTop - headerHeight) / contentMath
          return Math.max(0, Math.min(100, Math.round(scrollPercent * 100)))
        }
      })(),
  
      addEventListenerPjax: (ele, event, fn, option = false) => {
        ele.addEventListener(event, fn, option)
        btf.addGlobalFn('pjaxSendOnce', () => {
          ele.removeEventListener(event, fn, option)
        })
      },
  
      removeGlobalFnEvent: (key, parent = window) => {
        const globalFn = parent.globalFn || {}
        const keyObj = globalFn[key]
        if (!keyObj) return
  
        Object.keys(keyObj).forEach(i => keyObj[i]())
  
        delete globalFn[key]
      },
  
      switchComments: (el = document, path) => {
        const switchBtn = el.querySelector('#switch-btn')
        if (!switchBtn) return
  
        let switchDone = false;
        const postComment = el.querySelector('#post-comment')
        const handleSwitchBtn = () => {
          postComment.classList.toggle('move');
          if (!switchDone && typeof loadOtherComment === 'function') {
            switchDone = true
            loadOtherComment(el, path);
          }
        }
        btf.addEventListenerPjax(switchBtn, 'click', handleSwitchBtn)
      }
    }
  
    window.btf = { ...window.btf, ...btfFn };


    document.addEventListener('DOMContentLoaded', () => {
      let headerContentWidth, $nav
      let mobileSidebarOpen = false
    
      const adjustMenu = init => {
        const getAllWidth = ele => Array.from(ele).reduce((width, i) => width + i.offsetWidth, 0)
    
        if (init) {
          const blogInfoWidth = getAllWidth(document.querySelector('#blog-info > a').children)
          const menusWidth = getAllWidth(document.getElementById('menus').children)
          headerContentWidth = blogInfoWidth + menusWidth
          $nav = document.getElementById('nav')
        }
    
        const hideMenuIndex = window.innerWidth <= 768 || headerContentWidth > $nav.offsetWidth - 120
        $nav.classList.toggle('hide-menu', hideMenuIndex)
      }
    
      // 初始化header
      const initAdjust = () => {
        adjustMenu(true)
        $nav.classList.add('show')
      }
    
      // sidebar menus
      const sidebarFn = {
        open: () => {
          btf.overflowPaddingR.add()
          btf.animateIn(document.getElementById('menu-mask'), 'to_show 0.5s')
          document.getElementById('sidebar-menus').classList.add('open')
          mobileSidebarOpen = true
        },
        close: () => {
          btf.overflowPaddingR.remove()
          btf.animateOut(document.getElementById('menu-mask'), 'to_hide 0.5s')
          document.getElementById('sidebar-menus').classList.remove('open')
          mobileSidebarOpen = false
        }
      }
    
      /**
       * 首頁top_img底下的箭頭
       */
      const scrollDownInIndex = () => {
        const handleScrollToDest = () => {
          btf.scrollToDest(document.getElementById('content-inner').offsetTop, 300)
        }
    
        const $scrollDownEle = document.getElementById('scroll-down')
        $scrollDownEle && btf.addEventListenerPjax($scrollDownEle, 'click', handleScrollToDest)
      }
    
      /**
       * 代碼
       * 只適用於Hexo默認的代碼渲染
       */
      const addHighlightTool = () => {
        const highLight = GLOBAL_CONFIG.highlight
        if (!highLight) return
    
        const { highlightCopy, highlightLang, highlightHeightLimit, highlightFullpage, highlightMacStyle, plugin } = highLight
        const isHighlightShrink = GLOBAL_CONFIG_SITE.isHighlightShrink
        const isShowTool = highlightCopy || highlightLang || isHighlightShrink !== undefined || highlightFullpage || highlightMacStyle
        const $figureHighlight = plugin === 'highlight.js' ? document.querySelectorAll('figure.highlight') : document.querySelectorAll('pre[class*="language-"]')
    
        if (!((isShowTool || highlightHeightLimit) && $figureHighlight.length)) return
    
        const isPrismjs = plugin === 'prismjs'
        const highlightShrinkClass = isHighlightShrink === true ? 'closed' : ''
        const highlightShrinkEle = isHighlightShrink !== undefined ? '<i class="fas fa-angle-down expand"></i>' : ''
        const highlightCopyEle = highlightCopy ? '<div class="copy-notice"></div><i class="fas fa-paste copy-button"></i>' : ''
        const highlightMacStyleEle = '<div class="macStyle"><div class="mac-close"></div><div class="mac-minimize"></div><div class="mac-maximize"></div></div>'
        const highlightFullpageEle = highlightFullpage ? '<i class="fa-solid fa-up-right-and-down-left-from-center fullpage-button"></i>' : ''
    
        const alertInfo = (ele, text) => {
          if (GLOBAL_CONFIG.Snackbar !== undefined) {
            btf.snackbarShow(text)
          } else {
            ele.textContent = text
            ele.style.opacity = 1
            setTimeout(() => { ele.style.opacity = 0 }, 800)
          }
        }
    
        const copy = async (text, ctx) => {
          try {
            await navigator.clipboard.writeText(text)
            alertInfo(ctx, GLOBAL_CONFIG.copy.success)
          } catch (err) {
            console.error('Failed to copy: ', err)
            alertInfo(ctx, GLOBAL_CONFIG.copy.noSupport)
          }
        }
    
        // click events
        const highlightCopyFn = (ele, clickEle) => {
          const $buttonParent = ele.parentNode
          $buttonParent.classList.add('copy-true')
          const preCodeSelector = isPrismjs ? 'pre code' : 'table .code pre'
          const codeElement = $buttonParent.querySelector(preCodeSelector)
          if (!codeElement) return
          copy(codeElement.innerText, clickEle.previousElementSibling)
          $buttonParent.classList.remove('copy-true')
        }
    
        const highlightShrinkFn = ele => ele.classList.toggle('closed')
    
        const codeFullpage = (item, clickEle) => {
          const wrapEle = item.closest('figure.highlight')
          const isFullpage = wrapEle.classList.toggle('code-fullpage')
    
          document.body.style.overflow = isFullpage ? 'hidden' : ''
          clickEle.classList.toggle('fa-down-left-and-up-right-to-center', isFullpage)
          clickEle.classList.toggle('fa-up-right-and-down-left-from-center', !isFullpage)
        }
    
        const highlightToolsFn = e => {
          const $target = e.target.classList
          const currentElement = e.currentTarget
          if ($target.contains('expand')) highlightShrinkFn(currentElement)
          else if ($target.contains('copy-button')) highlightCopyFn(currentElement, e.target)
          else if ($target.contains('fullpage-button')) codeFullpage(currentElement, e.target)
        }
    
        const expandCode = e => e.currentTarget.classList.toggle('expand-done')
    
        // 獲取隱藏狀態下元素的真實高度
        const getActualHeight = item => {
          const hiddenElements = new Map()
    
          const fix = () => {
            let current = item
            while (current !== document.body && current != null) {
              if (window.getComputedStyle(current).display === 'none') {
                hiddenElements.set(current, current.getAttribute('style') || '')
              }
              current = current.parentNode
            }
    
            const style = 'visibility: hidden !important; display: block !important;'
            hiddenElements.forEach((originalStyle, elem) => {
              elem.setAttribute('style', originalStyle ? originalStyle + ';' + style : style)
            })
          }
    
          const restore = () => {
            hiddenElements.forEach((originalStyle, elem) => {
              if (originalStyle === '') elem.removeAttribute('style')
              else elem.setAttribute('style', originalStyle)
            })
          }
    
          fix()
          const height = item.offsetHeight
          restore()
          return height
        }
    
        const createEle = (lang, item) => {
          const fragment = document.createDocumentFragment()
    
          if (isShowTool) {
            const hlTools = document.createElement('div')
            hlTools.className = `highlight-tools ${highlightShrinkClass}`
            hlTools.innerHTML = highlightMacStyleEle + highlightShrinkEle + lang + highlightCopyEle + highlightFullpageEle
            btf.addEventListenerPjax(hlTools, 'click', highlightToolsFn)
            fragment.appendChild(hlTools)
          }
    
          if (highlightHeightLimit && getActualHeight(item) > highlightHeightLimit + 30) {
            const ele = document.createElement('div')
            ele.className = 'code-expand-btn'
            ele.innerHTML = '<i class="fas fa-angle-double-down"></i>'
            btf.addEventListenerPjax(ele, 'click', expandCode)
            fragment.appendChild(ele)
          }
    
          isPrismjs ? item.parentNode.insertBefore(fragment, item) : item.insertBefore(fragment, item.firstChild)
        }
    
        $figureHighlight.forEach(item => {
          let langName = ''
          if (isPrismjs) btf.wrap(item, 'figure', { class: 'highlight' })
    
          if (!highlightLang) {
            createEle('', item)
            return
          }
    
          if (isPrismjs) {
            langName = item.getAttribute('data-language') || 'Code'
          } else {
            langName = item.getAttribute('class').split(' ')[1]
            if (langName === 'plain' || langName === undefined) langName = 'Code'
          }
          createEle(`<div class="code-lang">${langName}</div>`, item)
        })
      }
    
      /**
       * PhotoFigcaption
       */
      const addPhotoFigcaption = () => {
        if (!GLOBAL_CONFIG.isPhotoFigcaption) return
        document.querySelectorAll('#article-container img').forEach(item => {
          const altValue = item.title || item.alt
          if (!altValue) return
          const ele = document.createElement('div')
          ele.className = 'img-alt text-center'
          ele.textContent = altValue
          item.insertAdjacentElement('afterend', ele)
        })
      }
    
      /**
       * Lightbox
       */
      const runLightbox = () => {
        btf.loadLightbox(document.querySelectorAll('#article-container img:not(.no-lightbox)'))
      }
    
      /**
       * justified-gallery 圖庫排版
       */
    
      const fetchUrl = async url => {
        try {
          const response = await fetch(url)
          return await response.json()
        } catch (error) {
          console.error('Failed to fetch URL:', error)
          return []
        }
      }
    
      const runJustifiedGallery = (container, data, config) => {
        const { isButton, limit, firstLimit, tabs } = config
    
        const dataLength = data.length
        const maxGroupKey = Math.ceil((dataLength - firstLimit) / limit + 1)
    
        // Gallery configuration
        const igConfig = {
          gap: 5,
          isConstantSize: true,
          sizeRange: [150, 600],
          // useResizeObserver: true,
          // observeChildren: true,
          useTransform: true
          // useRecycle: false
        }
    
        const ig = new InfiniteGrid.JustifiedInfiniteGrid(container, igConfig)
        let isLayoutHidden = false
    
        // Utility functions
        const sanitizeString = str => (str && str.replace(/"/g, '&quot;')) || ''
    
        const createImageItem = item => {
          const alt = item.alt ? `alt="${sanitizeString(item.alt)}"` : ''
          const title = item.title ? `title="${sanitizeString(item.title)}"` : ''
          return `<div class="item">
            <img src="${item.url}" data-grid-maintained-target="true" ${alt} ${title} />
          </div>`
        }
    
        const getItems = (nextGroupKey, count, isFirst = false) => {
          const startIndex = isFirst ? (nextGroupKey - 1) * count : (nextGroupKey - 2) * count + firstLimit
          return data.slice(startIndex, startIndex + count).map(createImageItem)
        }
    
        // Load more button
        const addLoadMoreButton = container => {
          const button = document.createElement('button')
          button.innerHTML = `${GLOBAL_CONFIG.infinitegrid.buttonText}<i class="fa-solid fa-arrow-down"></i>`
    
          button.addEventListener('click', () => {
            button.remove()
            btf.setLoading.add(container)
            appendItems(ig.getGroups().length + 1, limit)
          }, { once: true })
    
          container.insertAdjacentElement('afterend', button)
        }
    
        const appendItems = (nextGroupKey, count, isFirst) => {
          ig.append(getItems(nextGroupKey, count, isFirst), nextGroupKey)
        }
    
        // Event handlers
        const handleRenderComplete = e => {
          if (tabs) {
            const parentNode = container.parentNode
            if (isLayoutHidden) {
              parentNode.style.visibility = 'visible'
            }
            if (container.offsetHeight === 0) {
              parentNode.style.visibility = 'hidden'
              isLayoutHidden = true
            }
          }
    
          const { updated, isResize, mounted } = e
          if (!updated.length || !mounted.length || isResize) return
    
          btf.loadLightbox(container.querySelectorAll('img:not(.medium-zoom-image)'))
    
          if (ig.getGroups().length === maxGroupKey) {
            btf.setLoading.remove(container)
            !tabs && ig.off('renderComplete', handleRenderComplete)
            return
          }
    
          if (isButton) {
            btf.setLoading.remove(container)
            addLoadMoreButton(container)
          }
        }
    
        const handleRequestAppend = btf.debounce(e => {
          const nextGroupKey = (+e.groupKey || 0) + 1
    
          if (nextGroupKey === 1) appendItems(nextGroupKey, firstLimit, true)
          else appendItems(nextGroupKey, limit)
    
          if (nextGroupKey === maxGroupKey) ig.off('requestAppend', handleRequestAppend)
        }, 300)
    
        btf.setLoading.add(container)
        ig.on('renderComplete', handleRenderComplete)
    
        if (isButton) {
          appendItems(1, firstLimit, true)
        } else {
          ig.on('requestAppend', handleRequestAppend)
          ig.renderItems()
        }
    
        btf.addGlobalFn('pjaxSendOnce', () => ig.destroy())
      }
    
      const addJustifiedGallery = async (elements, tabs = false) => {
        if (!elements.length) return
    
        const initGallery = async () => {
          for (const element of elements) {
            if (btf.isHidden(element) || element.classList.contains('loaded')) continue
    
            const config = {
              isButton: element.getAttribute('data-button') === 'true',
              limit: parseInt(element.getAttribute('data-limit'), 10),
              firstLimit: parseInt(element.getAttribute('data-first'), 10),
              tabs
            }
    
            const container = element.firstElementChild
            const content = container.textContent
            container.textContent = ''
            element.classList.add('loaded')
    
            try {
              const data = element.getAttribute('data-type') === 'url' ? await fetchUrl(content) : JSON.parse(content)
              runJustifiedGallery(container, data, config)
            } catch (error) {
              console.error('Gallery data parsing failed:', error)
            }
          }
        }
    
        if (typeof InfiniteGrid === 'function') {
          await initGallery()
        } else {
          await btf.getScript(GLOBAL_CONFIG.infinitegrid.js)
          await initGallery()
        }
      }
    
      /**
       * rightside scroll percent
       */
      const rightsideScrollPercent = currentTop => {
        const scrollPercent = btf.getScrollPercent(currentTop, document.body)
        const goUpElement = document.getElementById('go-up')
    
        if (scrollPercent < 95) {
          goUpElement.classList.add('show-percent')
          goUpElement.querySelector('.scroll-percent').textContent = scrollPercent
        } else {
          goUpElement.classList.remove('show-percent')
        }
      }
    
      /**
       * 滾動處理
       */
      const scrollFn = () => {
        const $rightside = document.getElementById('rightside')
        const innerHeight = window.innerHeight + 56
        let initTop = 0
        const $header = document.getElementById('page-header')
        const isChatBtn = typeof chatBtn !== 'undefined'
        const isShowPercent = GLOBAL_CONFIG.percent.rightside
    
        // 檢查文檔高度是否小於視窗高度
        const checkDocumentHeight = () => {
          if (document.body.scrollHeight <= innerHeight) {
            $rightside.classList.add('rightside-show')
            return true
          }
          return false
        }
    
        // 如果文檔高度小於視窗高度,直接返回
        if (checkDocumentHeight()) return
    
        // find the scroll direction
        const scrollDirection = currentTop => {
          const result = currentTop > initTop // true is down & false is up
          initTop = currentTop
          return result
        }
    
        let flag = ''
        const scrollTask = btf.throttle(() => {
          const currentTop = window.scrollY || document.documentElement.scrollTop
          const isDown = scrollDirection(currentTop)
          if (currentTop > 56) {
            if (flag === '') {
              $header.classList.add('nav-fixed')
              $rightside.classList.add('rightside-show')
            }
    
            if (isDown) {
              if (flag !== 'down') {
                $header.classList.remove('nav-visible')
                isChatBtn && window.chatBtn.hide()
                flag = 'down'
              }
            } else {
              if (flag !== 'up') {
                $header.classList.add('nav-visible')
                isChatBtn && window.chatBtn.show()
                flag = 'up'
              }
            }
          } else {
            flag = ''
            if (currentTop === 0) {
              $header.classList.remove('nav-fixed', 'nav-visible')
            }
            $rightside.classList.remove('rightside-show')
          }
    
          isShowPercent && rightsideScrollPercent(currentTop)
          checkDocumentHeight()
        }, 300)
    
        btf.addEventListenerPjax(window, 'scroll', scrollTask, { passive: true })
      }
    
      /**
      * toc,anchor
      */
      const scrollFnToDo = () => {
        const isToc = GLOBAL_CONFIG_SITE.isToc
        const isAnchor = GLOBAL_CONFIG.isAnchor
        const $article = document.getElementById('article-container')
    
        if (!($article && (isToc || isAnchor))) return
    
        let $tocLink, $cardToc, autoScrollToc, $tocPercentage, isExpand
    
        if (isToc) {
          const $cardTocLayout = document.getElementById('card-toc')
          $cardToc = $cardTocLayout.querySelector('.toc-content')
          $tocLink = $cardToc.querySelectorAll('.toc-link')
          $tocPercentage = $cardTocLayout.querySelector('.toc-percentage')
          isExpand = $cardToc.classList.contains('is-expand')
    
          // toc元素點擊
          const tocItemClickFn = e => {
            const target = e.target.closest('.toc-link')
            if (!target) return
    
            e.preventDefault()
            btf.scrollToDest(btf.getEleTop(document.getElementById(decodeURI(target.getAttribute('href')).replace('#', ''))), 300)
            if (window.innerWidth < 900) {
              $cardTocLayout.classList.remove('open')
            }
          }
    
          btf.addEventListenerPjax($cardToc, 'click', tocItemClickFn)
    
          autoScrollToc = item => {
            const sidebarHeight = $cardToc.clientHeight
            const itemOffsetTop = item.offsetTop
            const itemHeight = item.clientHeight
            const scrollTop = $cardToc.scrollTop
            const offset = itemOffsetTop - scrollTop
            const middlePosition = (sidebarHeight - itemHeight) / 2
    
            if (offset !== middlePosition) {
              $cardToc.scrollTop = scrollTop + (offset - middlePosition)
            }
          }
    
          // 處理 hexo-blog-encrypt 事件
          $cardToc.style.display = 'block'
        }
    
        // find head position & add active class
        const $articleList = $article.querySelectorAll('h1,h2,h3,h4,h5,h6')
        let detectItem = ''
    
        const findHeadPosition = top => {
          if (top === 0) return false
    
          let currentId = ''
          let currentIndex = ''
    
          for (let i = 0; i < $articleList.length; i++) {
            const ele = $articleList[i]
            if (top > btf.getEleTop(ele) - 80) {
              const id = ele.id
              currentId = id ? '#' + encodeURI(id) : ''
              currentIndex = i
            } else {
              break
            }
          }
    
          if (detectItem === currentIndex) return
    
          if (isAnchor) btf.updateAnchor(currentId)
    
          detectItem = currentIndex
    
          if (isToc) {
            $cardToc.querySelectorAll('.active').forEach(i => i.classList.remove('active'))
    
            if (currentId) {
              const currentActive = $tocLink[currentIndex]
              currentActive.classList.add('active')
    
              setTimeout(() => autoScrollToc(currentActive), 0)
    
              if (!isExpand) {
                let parent = currentActive.parentNode
                while (!parent.matches('.toc')) {
                  if (parent.matches('li')) parent.classList.add('active')
                  parent = parent.parentNode
                }
              }
            }
          }
        }
    
        // main of scroll
        const tocScrollFn = btf.throttle(() => {
          const currentTop = window.scrollY || document.documentElement.scrollTop
          if (isToc && GLOBAL_CONFIG.percent.toc) {
            $tocPercentage.textContent = btf.getScrollPercent(currentTop, $article)
          }
          findHeadPosition(currentTop)
        }, 100)
    
        btf.addEventListenerPjax(window, 'scroll', tocScrollFn, { passive: true })
      }
    
      const handleThemeChange = mode => {
        const globalFn = window.globalFn || {}
        const themeChange = globalFn.themeChange || {}
        if (!themeChange) {
          return
        }
    
        Object.keys(themeChange).forEach(key => {
          const themeChangeFn = themeChange[key]
          if (['disqus', 'disqusjs'].includes(key)) {
            setTimeout(() => themeChangeFn(mode), 300)
          } else {
            themeChangeFn(mode)
          }
        })
      }
    
      /**
       * Rightside
       */
      const rightSideFn = {
        readmode: () => { // read mode
          const $body = document.body
          const newEle = document.createElement('button')
    
          const exitReadMode = () => {
            $body.classList.remove('read-mode')
            newEle.remove()
            newEle.removeEventListener('click', exitReadMode)
          }
    
          $body.classList.add('read-mode')
          newEle.type = 'button'
          newEle.className = 'fas fa-sign-out-alt exit-readmode'
          newEle.addEventListener('click', exitReadMode)
          $body.appendChild(newEle)
        },
        darkmode: () => { // switch between light and dark mode
          const willChangeMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
          if (willChangeMode === 'dark') {
            btf.activateDarkMode()
            GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night)
          } else {
            btf.activateLightMode()
            GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day)
          }
          btf.saveToLocal.set('theme', willChangeMode, 2)
          handleThemeChange(willChangeMode)
        },
        'rightside-config': item => { // Show or hide rightside-hide-btn
          const hideLayout = item.firstElementChild
          if (hideLayout.classList.contains('show')) {
            hideLayout.classList.add('status')
            setTimeout(() => {
              hideLayout.classList.remove('status')
            }, 300)
          }
    
          hideLayout.classList.toggle('show')
        },
        'go-up': () => { // Back to top
          btf.scrollToDest(0, 500)
        },
        'hide-aside-btn': () => { // Hide aside
          const $htmlDom = document.documentElement.classList
          const saveStatus = $htmlDom.contains('hide-aside') ? 'show' : 'hide'
          btf.saveToLocal.set('aside-status', saveStatus, 2)
          $htmlDom.toggle('hide-aside')
        },
        'mobile-toc-button': (p, item) => { // Show mobile toc
          const tocEle = document.getElementById('card-toc')
          tocEle.style.transition = 'transform 0.3s ease-in-out'
    
          const tocEleHeight = tocEle.clientHeight
          const btData = item.getBoundingClientRect()
    
          const tocEleBottom = window.innerHeight - btData.bottom - 30
          if (tocEleHeight > tocEleBottom) {
            tocEle.style.transformOrigin = `right ${tocEleHeight - tocEleBottom - btData.height / 2}px`
          }
    
          tocEle.classList.toggle('open')
          tocEle.addEventListener('transitionend', () => {
            tocEle.style.cssText = ''
          }, { once: true })
        },
        'chat-btn': () => { // Show chat
          window.chatBtnFn()
        },
        translateLink: () => { // switch between traditional and simplified chinese
          window.translateFn.translatePage()
        }
      }
    
      document.getElementById('rightside').addEventListener('click', e => {
        const $target = e.target.closest('[id]')
        if ($target && rightSideFn[$target.id]) {
          rightSideFn[$target.id](e.currentTarget, $target)
        }
      })
    
      /**
       * menu
       * 側邊欄sub-menu 展開/收縮
       */
      const clickFnOfSubMenu = () => {
        const handleClickOfSubMenu = e => {
          const target = e.target.closest('.site-page.group')
          if (!target) return
          target.classList.toggle('hide')
        }
    
        const menusItems = document.querySelector('#sidebar-menus .menus_items')
        menusItems && menusItems.addEventListener('click', handleClickOfSubMenu)
      }
    
      /**
       * 手机端目录点击
       */
      const openMobileMenu = () => {
        const toggleMenu = document.getElementById('toggle-menu')
        if (!toggleMenu) return
        btf.addEventListenerPjax(toggleMenu, 'click', () => { sidebarFn.open() })
      }
    
      /**
     * 複製時加上版權信息
     */
      const addCopyright = () => {
        const { limitCount, languages } = GLOBAL_CONFIG.copyright
    
        const handleCopy = (e) => {
          e.preventDefault()
          const copyFont = window.getSelection(0).toString()
          let textFont = copyFont
          if (copyFont.length > limitCount) {
            textFont = `${copyFont}\n\n\n${languages.author}\n${languages.link}${window.location.href}\n${languages.source}\n${languages.info}`
          }
          if (e.clipboardData) {
            return e.clipboardData.setData('text', textFont)
          } else {
            return window.clipboardData.setData('text', textFont)
          }
        }
    
        document.body.addEventListener('copy', handleCopy)
      }
    
      /**
       * 網頁運行時間
       */
      const addRuntime = () => {
        const $runtimeCount = document.getElementById('runtimeshow')
        if ($runtimeCount) {
          const publishDate = $runtimeCount.getAttribute('data-publishDate')
          $runtimeCount.textContent = `${btf.diffDate(publishDate)} ${GLOBAL_CONFIG.runtime}`
        }
      }
    
      /**
       * 最後一次更新時間
       */
      const addLastPushDate = () => {
        const $lastPushDateItem = document.getElementById('last-push-date')
        if ($lastPushDateItem) {
          const lastPushDate = $lastPushDateItem.getAttribute('data-lastPushDate')
          $lastPushDateItem.textContent = btf.diffDate(lastPushDate, true)
        }
      }
    
      /**
       * table overflow
       */
      const addTableWrap = () => {
        const $table = document.querySelectorAll('#article-container table')
        if (!$table.length) return
    
        $table.forEach(item => {
          if (!item.closest('.highlight')) {
            btf.wrap(item, 'div', { class: 'table-wrap' })
          }
        })
      }
    
      /**
       * tag-hide
       */
      const clickFnOfTagHide = () => {
        const hideButtons = document.querySelectorAll('#article-container .hide-button')
        if (!hideButtons.length) return
        hideButtons.forEach(item => item.addEventListener('click', e => {
          const currentTarget = e.currentTarget
          currentTarget.classList.add('open')
          addJustifiedGallery(currentTarget.nextElementSibling.querySelectorAll('.gallery-container'))
        }, { once: true }))
      }
    
      const tabsFn = () => {
        const navTabsElements = document.querySelectorAll('#article-container .tabs')
        if (!navTabsElements.length) return
    
        const setActiveClass = (elements, activeIndex) => {
          elements.forEach((el, index) => {
            el.classList.toggle('active', index === activeIndex)
          })
        }
    
        const handleNavClick = e => {
          const target = e.target.closest('button')
          if (!target || target.classList.contains('active')) return
    
          const navItems = [...e.currentTarget.children]
          const tabContents = [...e.currentTarget.nextElementSibling.children]
          const indexOfButton = navItems.indexOf(target)
          setActiveClass(navItems, indexOfButton)
          e.currentTarget.classList.remove('no-default')
          setActiveClass(tabContents, indexOfButton)
          addJustifiedGallery(tabContents[indexOfButton].querySelectorAll('.gallery-container'), true)
        }
    
        const handleToTopClick = tabElement => e => {
          if (e.target.closest('button')) {
            btf.scrollToDest(btf.getEleTop(tabElement), 300)
          }
        }
    
        navTabsElements.forEach(tabElement => {
          btf.addEventListenerPjax(tabElement.firstElementChild, 'click', handleNavClick)
          btf.addEventListenerPjax(tabElement.lastElementChild, 'click', handleToTopClick(tabElement))
        })
      }
    
      const toggleCardCategory = () => {
        const cardCategory = document.querySelector('#aside-cat-list.expandBtn')
        if (!cardCategory) return
    
        const handleToggleBtn = e => {
          const target = e.target
          if (target.nodeName === 'I') {
            e.preventDefault()
            target.parentNode.classList.toggle('expand')
          }
        }
        btf.addEventListenerPjax(cardCategory, 'click', handleToggleBtn, true)
      }
    
      const addPostOutdateNotice = () => {
        const ele = document.getElementById('post-outdate-notice')
        if (!ele) return
    
        const { limitDay, messagePrev, messageNext, postUpdate } = JSON.parse(ele.getAttribute('data'))
        const diffDay = btf.diffDate(postUpdate)
        if (diffDay >= limitDay) {
          ele.textContent = `${messagePrev} ${diffDay} ${messageNext}`
          ele.hidden = false
        }
      }
    
      const lazyloadImg = () => {
        window.lazyLoadInstance = new LazyLoad({
          elements_selector: 'img',
          threshold: 0,
          data_src: 'lazy-src'
        })
    
        btf.addGlobalFn('pjaxComplete', () => {
          window.lazyLoadInstance.update()
        }, 'lazyload')
      }
    
      const relativeDate = selector => {
        selector.forEach(item => {
          item.textContent = btf.diffDate(item.getAttribute('datetime'), true)
          item.style.display = 'inline'
        })
      }
    
      const justifiedIndexPostUI = () => {
        const recentPostsElement = document.getElementById('recent-posts')
        if (!(recentPostsElement && recentPostsElement.classList.contains('masonry'))) return
    
        const init = () => {
          const masonryItem = new InfiniteGrid.MasonryInfiniteGrid('.recent-post-items', {
            gap: { horizontal: 10, vertical: 20 },
            useTransform: true,
            useResizeObserver: true
          })
          masonryItem.renderItems()
          btf.addGlobalFn('pjaxCompleteOnce', () => { masonryItem.destroy() }, 'removeJustifiedIndexPostUI')
        }
    
        typeof InfiniteGrid === 'function' ? init() : btf.getScript(`${GLOBAL_CONFIG.infinitegrid.js}`).then(init)
      }
    
      const unRefreshFn = () => {
        window.addEventListener('resize', () => {
          adjustMenu(false)
          mobileSidebarOpen && btf.isHidden(document.getElementById('toggle-menu')) && sidebarFn.close()
        })
    
        const menuMask = document.getElementById('menu-mask')
        menuMask && menuMask.addEventListener('click', () => { sidebarFn.close() })
    
        clickFnOfSubMenu()
        GLOBAL_CONFIG.islazyloadPlugin && lazyloadImg()
        GLOBAL_CONFIG.copyright !== undefined && addCopyright()
    
        if (GLOBAL_CONFIG.autoDarkmode) {
          window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (btf.saveToLocal.get('theme') !== undefined) return
            e.matches ? handleThemeChange('dark') : handleThemeChange('light')
          })
        }
      }
    
      const forPostFn = () => {
        addHighlightTool()
        addPhotoFigcaption()
        addJustifiedGallery(document.querySelectorAll('#article-container .gallery-container'))
        runLightbox()
        scrollFnToDo()
        addTableWrap()
        clickFnOfTagHide()
        tabsFn()
      }
    
      const refreshFn = () => {
        initAdjust()
        justifiedIndexPostUI()
    
        if (GLOBAL_CONFIG_SITE.pageType === 'post') {
          addPostOutdateNotice()
          GLOBAL_CONFIG.relativeDate.post && relativeDate(document.querySelectorAll('#post-meta time'))
        } else {
          GLOBAL_CONFIG.relativeDate.homepage && relativeDate(document.querySelectorAll('#recent-posts time'))
          GLOBAL_CONFIG.runtime && addRuntime()
          addLastPushDate()
          toggleCardCategory()
        }
    
        GLOBAL_CONFIG_SITE.pageType === 'home' && scrollDownInIndex()
        scrollFn()
    
        forPostFn()
        GLOBAL_CONFIG_SITE.pageType !== 'shuoshuo' && btf.switchComments(document)
        openMobileMenu()
      }
    
      btf.addGlobalFn('pjaxComplete', refreshFn, 'refreshFn')
      refreshFn()
      unRefreshFn()
    
      // 處理 hexo-blog-encrypt 事件
      window.addEventListener('hexo-blog-decrypt', e => {
        forPostFn()
        window.translateFn.translateInitialization()
        Object.values(window.globalFn.encrypt).forEach(fn => {
          fn()
        })
      })
    })
    



})()


window.lazySizesConfig = window.lazySizesConfig || {};

window.lazySizesConfig.expand = 800;
// 单例管理
let imageViewerInstance = null

function initImageViewer() {
// 清理旧实例
if (imageViewerInstance) {
  imageViewerInstance.destroy()
  imageViewerInstance = null
}

// 等待懒加载完成
  imageViewerInstance = new ImageViewer()

}


var pjax = new Pjax({
elements: 'a',
selectors: [
 "title",
  "meta",
  ".site-title",
  ".layout"
],
cacheBust: false
})
document.addEventListener("pjax:success", whenDOMReady);
     // 进度条控制
      let loader = document.querySelector('.pjax-loader')
      
      // PJAX 生命周期事件
      document.addEventListener('pjax:send', function() {
          // 开始加载时显示进度条
          loader.style.width = '70%'
          
          // 添加页面退出动画
          let oldContent = document.querySelector('#pjax-container .page-content')
          if (oldContent) {
              oldContent.classList.add('page-out')
          }
      })

      document.addEventListener('pjax:complete', function() {
          // 加载完成时隐藏进度条
          loader.style.width = '100%'
          setTimeout(() => {
              loader.style.width = '0%'
          }, 300)

          // 处理新内容进入动画
          let newContent = document.querySelector('#pjax-container .page-content')
          if (newContent) {
              newContent.classList.add('page-in')
              // 触发重绘
              void newContent.offsetWidth
              newContent.classList.remove('page-in')
          }
      })

      document.addEventListener('pjax:error', function(err) {
          console.error('PJAX Error:', err)
          loader.style.width = '0%'
      })
      document.addEventListener('pjax:send', function() {
  document.body.classList.add('pjax-loading')
})

document.addEventListener('pjax:complete', function() {
  document.body.classList.remove('pjax-loading')
})

// 动态注入样式
const galleryStyle = document.createElement('style');
galleryStyle.textContent = `
.gallery-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.95);
  z-index: 2147483647;
  cursor: zoom-out;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-image-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  transition: transform 0.3s ease;
}

.gallery-image {
  max-width: 100%;
  max-height: 100vh;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.3s;
}

.gallery-nav {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: #070c13;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  z-index: 1;
}

.gallery-prev { left: 20px; }
.gallery-next { right: 20px; }

.gallery-counter {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 14px;
  background: rgba(0,0,0,0.5);
  padding: 5px 15px;
  border-radius: 20px;
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  border: 4px solid #070c13;
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  transform: translate(-50%, -50%);
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  color: #ff4444;
  transform: translate(-50%, -50%);
  white-space: nowrap;
}

@keyframes spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.zoom-controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.5);
  padding: 10px;
  border-radius: 8px;
  display: flex;
  gap: 10px;
}

.zoom-btn {
  width: 40px;
  height: 40px;
  background: #070c13;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.gallery-close {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: #070c13;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  z-index: 2147483647;
}

.gallery-close:hover {
  background: #070c13;
  transform: rotate(90deg);
  transition: all 0.3s ease;
}
.gallery-image-container {
  cursor: grab;
  touch-action: none; /* 防止触摸滚动 */
}
.gallery-image-container {
  cursor: grab;
  transition: transform 0.15s cubic-bezier(0.17, 0.67, 0.35, 0.97);
}

.gallery-image-container:active {
  cursor: grabbing;
}
`;
document.head.appendChild(galleryStyle);

class ImageViewer {
  constructor() {
      this.images = [];
      this.currentIndex = 0;
      this.scale = 1;
      this.init();
       this.isDragging = false;
      this.startX = 0;
      this.startY = 0;
      this.offsetX = 0;
      this.offsetY = 0;
  }

  init() {
      this.loadImages();
  }

  loadImages() {
       const article = document.querySelector('#article-container');
  this.images = article ? Array.from(article.querySelectorAll('img[data-src]')) : [];
      
      this.images.forEach((img, index) => {
          img.dataset.galleryIndex = index;
          img.style.cursor = 'zoom-in';
          img.addEventListener('click', (e) => {
              e.stopPropagation();
              this.show(index);
          });
      });
  }

  show(index) {
      this.currentIndex = index;
      this.scale = 1;
      this.createOverlay();
      this.loadCurrentImage();
  }

  createOverlay() {
      this.overlay = document.createElement('div');
      this.overlay.className = 'gallery-overlay';
      
      // 图片容器
      this.imageContainer = document.createElement('div');
      this.imageContainer.className = 'gallery-image-container';
      
      
      // 图片元素
      this.imageEl = document.createElement('img');
      this.imageEl.className = 'gallery-image';
      
      // 加载动画
      this.loader = document.createElement('div');
      this.loader.className = 'loading-spinner';
      
      // 导航按钮
      this.prevBtn = this.createButton('❮', 'gallery-prev');
      this.nextBtn = this.createButton('❯', 'gallery-next');
      this.counter = this.createCounter();
      
      // 缩放控件
      this.zoomControls = this.createZoomControls();
      
      // 组合元素
      this.imageContainer.append(this.imageEl, this.loader);
      this.overlay.append(
          this.prevBtn,
          this.imageContainer,
          this.nextBtn,
          this.counter,
          this.zoomControls
      );
      document.body.appendChild(this.overlay);
      document.body.style.overflow = 'hidden';
        // 添加关闭按钮
      this.closeBtn = document.createElement('div');
      this.closeBtn.className = 'gallery-close';
      this.closeBtn.textContent = '×';
      this.closeBtn.onclick = () => this.close();
      
      // 组合元素添加关闭按钮
      this.overlay.append(
          this.prevBtn,
          this.imageContainer,
          this.nextBtn,
          this.counter,
          this.zoomControls,
          this.closeBtn  // 添加关闭按钮
      );
       // 添加拖拽相关样式
      this.imageContainer.style.cursor = 'grab';
      this.imageContainer.style.touchAction = 'none';
  }

  createButton(text, className) {
      const btn = document.createElement('div');
      btn.className = `gallery-nav ${className}`;
      btn.textContent = text;
      return btn;
  }

  createCounter() {
      const counter = document.createElement('div');
      counter.className = 'gallery-counter';
      return counter;
  }

  createZoomControls() {
      const container = document.createElement('div');
      container.className = 'zoom-controls';
      
      const zoomIn = document.createElement('div');
      zoomIn.className = 'zoom-btn';
      zoomIn.textContent = '+';
      zoomIn.onclick = () => this.setScale(this.scale + 0.2);
      
      const zoomOut = document.createElement('div');
      zoomOut.className = 'zoom-btn';
      zoomOut.textContent = '-';
      zoomOut.onclick = () => this.setScale(this.scale - 0.2);
      
      const reset = document.createElement('div');
      reset.className = 'zoom-btn';
      reset.textContent = '↺';
      reset.onclick = () => this.resetScale();
      
      container.append(zoomIn, zoomOut, reset);
      return container;
  }

  async loadCurrentImage() {
      try {
          this.showLoading();
          const src = this.images[this.currentIndex].dataset.src.split('?')[0];
          await this.loadImage(src);

          this.hideLoading();  // 新增隐藏加载动画方法
          this.updateInterface();
      } catch (error) {
          this.showError('图片加载失败');
      }
  }
// 新增隐藏加载动画方法
  hideLoading() {
      this.loader.style.display = 'none';
  }

  loadImage(src) {
      return new Promise((resolve, reject) => {
          this.imageEl.onload = () => {
              this.imageEl.style.opacity = 1;

              this.hideLoading();  // 确保图片加载后隐藏加载动画
              resolve();
          };
          this.imageEl.onerror = () => reject();
          this.imageEl.src = src;
      });
  }

  showLoading() {
      this.loader.style.display = 'block';
      this.imageEl.style.opacity = 0;
  }

  showError(message) {
      const error = document.createElement('div');
      error.className = 'error-message';
      error.textContent = message;
      this.imageContainer.appendChild(error);
      this.loader.style.display = 'none';
  }

  updateInterface() {
      // 更新计数器
      this.counter.textContent = `${this.currentIndex + 1}/${this.images.length}`;
      
      // 更新导航按钮状态
      this.prevBtn.style.display = this.currentIndex > 0 ? 'flex' : 'none';
      this.nextBtn.style.display = this.currentIndex < this.images.length - 1 ? 'flex' : 'none';
      
      // 绑定事件
      this.bindEvents();
  }

  bindEvents() {
      // 导航事件
      this.prevBtn.onclick = () => this.navigate(-1);
      this.nextBtn.onclick = () => this.navigate(1);
      
      // 遮罩点击关闭
      this.overlay.onclick = (e) => {
          if (e.target === this.overlay) this.close();
      };
      
      // 键盘事件
      this.keyHandler = (e) => {
          switch(e.key) {
              case 'ArrowLeft': this.navigate(-1); break;
              case 'ArrowRight': this.navigate(1); break;
              case 'Escape': this.close(); break;
              case '+': this.setScale(this.scale + 0.2); break;
              case '-': this.setScale(this.scale - 0.2); break;
              case '0': this.resetScale(); break;
          }
      };
      document.addEventListener('keydown', this.keyHandler);
      
      // 滚轮缩放
      this.wheelHandler = (e) => {
          e.preventDefault();
          const delta = Math.sign(e.deltaY) * -0.1;
          this.setScale(this.scale + delta);
      };
      this.overlay.addEventListener('wheel', this.wheelHandler);
      
      // 触摸事件
      let touchStartX = 0;
      this.overlay.addEventListener('touchstart', (e) => {
          touchStartX = e.touches[0].clientX;
      });
      this.overlay.addEventListener('touchend', (e) => {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          if (Math.abs(deltaX) > 50) this.navigate(deltaX > 0 ? -1 : 1);
      });
       // 鼠标事件
      this.imageContainer.addEventListener('mousedown', this.handleDragStart);
      document.addEventListener('mousemove', this.handleDragMove);
      document.addEventListener('mouseup', this.handleDragEnd);

      // 触摸事件
      this.imageContainer.addEventListener('touchstart', this.handleDragStart);
      document.addEventListener('touchmove', this.handleDragMove);
      document.addEventListener('touchend', this.handleDragEnd);
  }
      handleDragStart = (e) => {
      if (this.scale <= 1) return;
      this.isDragging = true;
      
      const clientX = e.clientX ?? e.touches[0].clientX;
      const clientY = e.clientY ?? e.touches[0].clientY;
      
      this.startX = clientX - this.offsetX;
      this.startY = clientY - this.offsetY;
      this.imageContainer.style.cursor = 'grabbing';
  }
  handleDragMove = (e) => {
      if (!this.isDragging || this.scale <= 1) return;

      const clientX = e.clientX ?? e.touches[0]?.clientX;
      const clientY = e.clientY ?? e.touches[0]?.clientY;
      if (!clientX || !clientY) return;

      const newOffsetX = clientX - this.startX;
      const newOffsetY = clientY - this.startY;
      
      const constrained = this.constrainOffset(newOffsetX, newOffsetY);
      this.offsetX = constrained.x;
      this.offsetY = constrained.y;
      
      this.updateTransform();
  }
    handleDragEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.imageContainer.style.cursor = 'grab';
  }

  constrainOffset(x, y) {
      const containerRect = this.imageContainer.getBoundingClientRect();
      const scaledWidth = containerRect.width * this.scale;
      const scaledHeight = containerRect.height * this.scale;
      
      const maxX = Math.max((scaledWidth - containerRect.width) / 2, 0);
      const maxY = Math.max((scaledHeight - containerRect.height) / 2, 0);
      
      return {
          x: Math.max(Math.min(x, maxX), -maxX),
          y: Math.max(Math.min(y, maxY), -maxY)
      };
  }
    updateTransform() {
      this.imageContainer.style.transform = 
          `scale(${this.scale}) 
           translate(${this.offsetX}px, ${this.offsetY}px)`;
  }
  setScale(newScale) {
      // 缩放时重置偏移量
      if (newScale <= 1) {
          this.offsetX = 0;
          this.offsetY = 0;
      }
      this.scale = Math.min(Math.max(newScale, 0.5), 3);
      this.updateTransform();
  }

  navigate(offset) {
      this.currentIndex = (this.currentIndex + offset + this.images.length) % this.images.length;
      this.scale = 1;
       this.offsetX = 0;
      this.offsetY = 0;
      this.imageContainer.style.transform = `scale(1)`;
      this.loadCurrentImage();
  }

  setScale(newScale) {
      this.scale = Math.min(Math.max(newScale, 0.5), 3);
      this.imageContainer.style.transform = `scale(${this.scale})`;
  }

  resetScale() {
      this.scale = 1;
      this.imageContainer.style.transform = 'scale(1)';
  }

  close() {
      document.removeEventListener('mousemove', this.handleDragMove);
      document.removeEventListener('mouseup', this.handleDragEnd);
      document.removeEventListener('touchmove', this.handleDragMove);
      document.removeEventListener('touchend', this.handleDragEnd)
      document.body.removeChild(this.overlay);
      document.body.style.overflow = '';
      document.removeEventListener('keydown', this.keyHandler);
  }
}

function whenDOMReady() {
window.lazySizesConfig = window.lazySizesConfig || {};

window.lazySizesConfig.expand = 800;
// do your stuff
lazySizes.init();
hljs.highlightAll();
// 图片查看器初始化
new ImageViewer();
}

whenDOMReady()