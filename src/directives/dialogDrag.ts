import type { App } from 'vue'

/**
 * Global Dialog Drag & Resize plugin
 * - Automatically makes all Element Plus <el-dialog> draggable and resizable
 * - No need to add props or directives on each dialog
 */

// 拖拽手柄类型
type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

function parseCurrentTranslate(element: HTMLElement): { x: number; y: number } {
  const style = window.getComputedStyle(element)
  const transform = style.transform
  if (!transform || transform === 'none') {
    return { x: 0, y: 0 }
  }
  // matrix(a, b, c, d, tx, ty)
  const match = transform.match(/matrix\(([-0-9.,\s]+)\)/)
  if (match && match[1]) {
    const parts = match[1].split(',').map((v) => Number(v.trim()))
    const x = parts[4] || 0
    const y = parts[5] || 0
    return { x, y }
  }
  return { x: 0, y: 0 }
}

// 创建拖拽手柄
function createResizeHandle(_dialogEl: HTMLElement, position: ResizeHandle): HTMLElement {
  const handle = document.createElement('div')
  handle.className = `dialog-resize-handle dialog-resize-${position}`
  handle.style.cssText = `
    position: absolute;
    z-index: 1000;
    background: transparent;
  `
  
  // 设置手柄位置和大小
  const size = 8
  const offset = size / 2
  
  switch (position) {
    case 'n':
      handle.style.cssText += `
        top: -${offset}px;
        left: 50%;
        transform: translateX(-50%);
        width: 100px;
        height: ${size}px;
        cursor: n-resize;
      `
      break
    case 's':
      handle.style.cssText += `
        bottom: -${offset}px;
        left: 50%;
        transform: translateX(-50%);
        width: 100px;
        height: ${size}px;
        cursor: s-resize;
      `
      break
    case 'e':
      handle.style.cssText += `
        top: 50%;
        right: -${offset}px;
        transform: translateY(-50%);
        width: ${size}px;
        height: 100px;
        cursor: e-resize;
      `
      break
    case 'w':
      handle.style.cssText += `
        top: 50%;
        left: -${offset}px;
        transform: translateY(-50%);
        width: ${size}px;
        height: 100px;
        cursor: w-resize;
      `
      break
    case 'ne':
      handle.style.cssText += `
        top: -${offset}px;
        right: -${offset}px;
        width: ${size}px;
        height: ${size}px;
        cursor: ne-resize;
      `
      break
    case 'nw':
      handle.style.cssText += `
        top: -${offset}px;
        left: -${offset}px;
        width: ${size}px;
        height: ${size}px;
        cursor: nw-resize;
      `
      break
    case 'se':
      handle.style.cssText += `
        bottom: -${offset}px;
        right: -${offset}px;
        width: ${size}px;
        height: ${size}px;
        cursor: se-resize;
      `
      break
    case 'sw':
      handle.style.cssText += `
        bottom: -${offset}px;
        left: -${offset}px;
        width: ${size}px;
        height: ${size}px;
        cursor: sw-resize;
      `
      break
  }
  
  return handle
}

function makeDialogDraggableAndResizable(dialogEl: HTMLElement) {
  if (dialogEl.dataset.draggableBound === '1') return

  const headerEl = dialogEl.querySelector('.el-dialog__header') as HTMLElement | null
  if (!headerEl) return

  // 设置对话框样式
  headerEl.style.cursor = 'move'
  dialogEl.style.willChange = 'transform, width, height'
  dialogEl.style.position = 'relative'

  // 拖拽相关变量
  let startX = 0
  let startY = 0
  let originX = 0
  let originY = 0
  let dragging = false

  // 调整大小相关变量
  let resizing = false
  let resizeHandle: ResizeHandle | null = null
  let originalWidth = 0
  let originalHeight = 0
  let originalLeft = 0
  let originalTop = 0

  // 拖拽鼠标移动处理
  const onDragMouseMove = (e: MouseEvent) => {
    if (!dragging) return
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY
    const nextX = originX + deltaX
    const nextY = originY + deltaY
    dialogEl.style.transform = `translate(${nextX}px, ${nextY}px)`
  }

  // 调整大小鼠标移动处理
  const onResizeMouseMove = (e: MouseEvent) => {
    if (!resizing || !resizeHandle) return
    
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY
    
    let newWidth = originalWidth
    let newHeight = originalHeight
    let newLeft = originalLeft
    let newTop = originalTop
    
    // 根据拖拽手柄调整大小
    switch (resizeHandle) {
      case 'e':
        newWidth = Math.max(300, originalWidth + deltaX)
        break
      case 'w':
        newWidth = Math.max(300, originalWidth - deltaX)
        newLeft = originalLeft + deltaX
        break
      case 's':
        newHeight = Math.max(200, originalHeight + deltaY)
        break
      case 'n':
        newHeight = Math.max(200, originalHeight - deltaY)
        newTop = originalTop + deltaY
        break
      case 'se':
        newWidth = Math.max(300, originalWidth + deltaX)
        newHeight = Math.max(200, originalHeight + deltaY)
        break
      case 'sw':
        newWidth = Math.max(300, originalWidth - deltaX)
        newHeight = Math.max(200, originalHeight + deltaY)
        newLeft = originalLeft + deltaX
        break
      case 'ne':
        newWidth = Math.max(300, originalWidth + deltaX)
        newHeight = Math.max(200, originalHeight - deltaY)
        newTop = originalTop + deltaY
        break
      case 'nw':
        newWidth = Math.max(300, originalWidth - deltaX)
        newHeight = Math.max(200, originalHeight - deltaY)
        newLeft = originalLeft + deltaX
        newTop = originalTop + deltaY
        break
    }
    
    // 应用新的尺寸和位置
    dialogEl.style.width = `${newWidth}px`
    dialogEl.style.height = `${newHeight}px`
    if (newLeft !== originalLeft) {
      const { x } = parseCurrentTranslate(dialogEl)
      dialogEl.style.transform = `translate(${x + newLeft - originalLeft}px, ${parseCurrentTranslate(dialogEl).y}px)`
    }
    if (newTop !== originalTop) {
      const { y } = parseCurrentTranslate(dialogEl)
      dialogEl.style.transform = `translate(${parseCurrentTranslate(dialogEl).x}px, ${y + newTop - originalTop}px)`
    }
  }

  // 鼠标抬起处理
  const onMouseUp = () => {
    dragging = false
    resizing = false
    resizeHandle = null
    document.removeEventListener('mousemove', onDragMouseMove)
    document.removeEventListener('mousemove', onResizeMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  // 拖拽鼠标按下处理
  const onDragMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return
    dragging = true
    const { x, y } = parseCurrentTranslate(dialogEl)
    originX = x
    originY = y
    startX = e.clientX
    startY = e.clientY
    document.addEventListener('mousemove', onDragMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  // 调整大小鼠标按下处理
  const onResizeMouseDown = (e: MouseEvent, handle: ResizeHandle) => {
    if (e.button !== 0) return
    e.stopPropagation()
    resizing = true
    resizeHandle = handle
    
    const rect = dialogEl.getBoundingClientRect()
    originalWidth = rect.width
    originalHeight = rect.height
    originalLeft = 0
    originalTop = 0
    
    startX = e.clientX
    startY = e.clientY
    document.addEventListener('mousemove', onResizeMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  // 绑定拖拽事件
  headerEl.addEventListener('mousedown', onDragMouseDown)

  // 创建并绑定调整大小手柄
  const handles: ResizeHandle[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']
  handles.forEach(handle => {
    const handleEl = createResizeHandle(dialogEl, handle)
    handleEl.addEventListener('mousedown', (e) => onResizeMouseDown(e, handle))
    dialogEl.appendChild(handleEl)
  })

  dialogEl.dataset.draggableBound = '1'
}

function scanAndBind(root: HTMLElement | Document = document) {
  const dialogs = root.querySelectorAll<HTMLElement>('.el-dialog')
  dialogs.forEach((dlg) => makeDialogDraggableAndResizable(dlg))
}

export default {
  install(_app: App) {
    // Initial scan in case dialogs already exist
    scanAndBind()

    // Observe future dialogs
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return
          const el = node as HTMLElement
          if (el.classList && el.classList.contains('el-dialog')) {
            makeDialogDraggableAndResizable(el)
          } else {
            scanAndBind(el)
          }
        })
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
  }
}


