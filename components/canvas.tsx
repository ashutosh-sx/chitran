"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useWhiteboard } from "@/context/whiteboard-context"
import { useToast } from "@/hooks/use-toast"

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const textInputRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { toast } = useToast()

  const {
    activeTool,
    strokeWidth,
    strokeColor,
    fillColor,
    opacity,
    zoom,
    setSelectedObject,
    selectedObject,
    addObject,
    objects,
    showGrid,
    snapToGrid,
    gridSize,
    updateSelectedObject,
    clearSelection,
    setActiveTool,
    setObjects,
  } = useWhiteboard()

  const [isDrawing, setIsDrawing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [currentShape, setCurrentShape] = useState<any>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartY, setDragStartY] = useState(0)
  const [resizing, setResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState("")
  const [images, setImages] = useState<{ [key: string]: HTMLImageElement }>({})
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [stickerPosition, setStickerPosition] = useState({ x: 0, y: 0 })

  // Function to redraw the canvas
  const redrawCanvas = useCallback(
    (tempShape?: any) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)

      // Draw grid if enabled - always draw grid first
      if (showGrid) {
        drawGrid(ctx)
      }

      // Apply zoom
      ctx.save()
      ctx.scale(zoom, zoom)

      // Draw all objects
      objects.forEach((object) => {
        drawObject(ctx, object)
      })

      // Draw temporary shape being created
      if (tempShape) {
        drawObject(ctx, tempShape)
      }

      // Draw selection handles
      if (selectedObject && !isDrawing && !editingTextId) {
        drawSelectionHandles(ctx, selectedObject)
      }

      ctx.restore()
    },
    [objects, selectedObject, showGrid, zoom, isDrawing, editingTextId],
  )

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    // Set canvas size to match container
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = container.clientWidth * dpr
      canvas.height = container.clientHeight * dpr
      canvas.style.width = `${container.clientWidth}px`
      canvas.style.height = `${container.clientHeight}px`

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.scale(dpr, dpr)
      }

      redrawCanvas()
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [redrawCanvas])

  // Create file input for image upload
  useEffect(() => {
    // Create file input for image upload
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.style.display = "none"

    const handleImageUploadEvent = (e: Event) => {
      handleImageUpload(e)
    }

    input.addEventListener("change", handleImageUploadEvent)
    document.body.appendChild(input)
    fileInputRef.current = input

    return () => {
      input.removeEventListener("change", handleImageUploadEvent)
      document.body.removeChild(input)
    }
  }, [])

  // Handle image upload
  const handleImageUpload = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files[0]) {
      const file = target.files[0]
      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target?.result) {
          const img = new Image()
          img.crossOrigin = "anonymous" // Add this to prevent CORS issues
          img.onload = () => {
            const imageObj = {
              id: Date.now().toString(),
              type: "image",
              x: 100,
              y: 100,
              width: img.width > 300 ? 300 : img.width,
              height: img.height * (img.width > 300 ? 300 / img.width : 1),
              src: event.target?.result as string,
              opacity: opacity,
            }

            // Store the image element for drawing
            setImages((prev) => ({
              ...prev,
              [imageObj.id]: img,
            }))

            addObject(imageObj)
            setSelectedObject(imageObj)
            redrawCanvas()

            // Switch back to select tool after inserting image
            setActiveTool("select")
          }
          img.src = event.target.result as string
        }
      }

      reader.readAsDataURL(file)
    }
  }

  // Handle sticker selection
  const handleStickerSelect = (stickerUrl: string) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const stickerObj = {
        id: Date.now().toString(),
        type: "sticker",
        x: stickerPosition.x,
        y: stickerPosition.y,
        width: 60,
        height: 60,
        src: stickerUrl,
        opacity: opacity,
      }

      setImages((prev) => ({
        ...prev,
        [stickerObj.id]: img,
      }))

      addObject(stickerObj)
      setSelectedObject(stickerObj)
      redrawCanvas()
      setShowStickerPicker(false)

      // Switch back to select tool after inserting sticker
      setActiveTool("select")
    }
    img.src = stickerUrl
  }

  // Redraw canvas when objects change
  useEffect(() => {
    redrawCanvas()
  }, [objects, selectedObject, showGrid, zoom, redrawCanvas])

  // Create text editing functionality
  const createTextEditor = useCallback(
    (x: number, y: number, existingText = "", existingId = null) => {
      if (textInputRef.current) {
        // Remove any existing text input
        if (textInputRef.current.parentNode) {
          textInputRef.current.parentNode.removeChild(textInputRef.current)
        }
        textInputRef.current = null
      }

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const posX = x * zoom + rect.left
      const posY = y * zoom + rect.top

      const textArea = document.createElement("textarea")
      textArea.style.position = "absolute"
      textArea.style.left = `${posX}px`
      textArea.style.top = `${posY}px`
      textArea.style.border = "2px solid #4f46e5"
      textArea.style.padding = "4px"
      textArea.style.minWidth = "150px"
      textArea.style.minHeight = "30px"
      textArea.style.zIndex = "1000"
      textArea.style.background = "white"
      textArea.style.fontFamily = "sans-serif"
      textArea.style.fontSize = "16px"
      textArea.style.resize = "both"
      textArea.style.overflow = "hidden"
      textArea.value = existingText

      const handleBlur = () => {
        const text = textArea.value.trim()
        if (text) {
          if (existingId) {
            // Update existing text
            const textObj = objects.find((obj) => obj.id === existingId)
            if (textObj) {
              updateSelectedObject({
                ...textObj,
                text,
              })
            }
            setEditingTextId(null)
          } else {
            // Create new text
            const textObj = {
              id: Date.now().toString(),
              type: "text",
              x: x,
              y: y + 16, // Add font size to position text properly
              text,
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor,
              opacity,
            }
            addObject(textObj)
            setSelectedObject(textObj)

            // Switch back to select tool after adding text
            setActiveTool("select")
          }
        }

        if (textArea.parentNode) {
          textArea.parentNode.removeChild(textArea)
        }
        textInputRef.current = null
        redrawCanvas()
      }

      textArea.addEventListener("blur", handleBlur)

      // Handle key events
      textArea.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          textArea.blur()
        } else if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          textArea.blur()
        }
      })

      document.body.appendChild(textArea)
      textInputRef.current = textArea

      // Focus and select all text after a small delay to ensure it works
      setTimeout(() => {
        textArea.focus()
        if (existingText) {
          textArea.select()
        }
      }, 10)
    },
    [
      addObject,
      objects,
      setSelectedObject,
      strokeColor,
      opacity,
      updateSelectedObject,
      zoom,
      redrawCanvas,
      setActiveTool,
    ],
  )

  // Snap to grid function
  const snapToGridPoint = (value: number) => {
    if (!snapToGrid) return value
    return Math.round(value / gridSize) * gridSize
  }

  // Handle mouse events
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getCanvasPoint = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / zoom
      const y = (e.clientY - rect.top) / zoom
      return { x, y }
    }

    const handleMouseDown = (e: MouseEvent) => {
      const { x, y } = getCanvasPoint(e)
      const snappedX = snapToGridPoint(x)
      const snappedY = snapToGridPoint(y)

      // Handle image upload tool
      if (activeTool === "image") {
        if (fileInputRef.current) {
          fileInputRef.current.click()
        }
        return
      }

      // Handle sticker tool
      if (activeTool === "sticker") {
        setStickerPosition({ x: snappedX, y: snappedY })
        setShowStickerPicker(true)
        return
      }

      // Check if clicking on a selected object's resize handle
      if (selectedObject) {
        const handle = getResizeHandleUnderMouse(x, y)
        if (handle) {
          setResizing(true)
          setResizeHandle(handle)
          return
        }

        // Check if clicking on a selected object to drag
        if (isPointInObject(x, y, selectedObject)) {
          // If it's a text object, check for double click to edit
          if (selectedObject.type === "text" && e.detail === 2) {
            setEditingTextId(selectedObject.id)
            createTextEditor(selectedObject.x, selectedObject.y - 16, selectedObject.text, selectedObject.id)
            return
          }

          setIsDragging(true)
          setDragStartX(x - selectedObject.x)
          setDragStartY(y - selectedObject.y)
          return
        }
      }

      // Check if clicking on any object to select
      if (activeTool === "select") {
        for (let i = objects.length - 1; i >= 0; i--) {
          if (isPointInObject(x, y, objects[i])) {
            // If it's a text object, check for double click to edit
            if (objects[i].type === "text" && e.detail === 2) {
              setSelectedObject(objects[i])
              setEditingTextId(objects[i].id)
              createTextEditor(objects[i].x, objects[i].y - 16, objects[i].text, objects[i].id)
              return
            }

            setSelectedObject(objects[i])
            setIsDragging(true)
            setDragStartX(x - objects[i].x)
            setDragStartY(y - objects[i].y)
            return
          }
        }
        // If clicked on empty space, clear selection
        clearSelection()
        return
      }

      // Start drawing
      setIsDrawing(true)
      setStartX(snappedX)
      setStartY(snappedY)

      if (activeTool === "pen" || activeTool === "brush" || activeTool === "highlighter") {
        const newPath = {
          id: Date.now().toString(),
          type: activeTool,
          points: [{ x: snappedX, y: snappedY }],
          strokeWidth:
            activeTool === "brush" ? strokeWidth * 1.5 : activeTool === "highlighter" ? strokeWidth * 3 : strokeWidth,
          strokeColor: activeTool === "highlighter" ? `${strokeColor}80` : strokeColor, // 50% opacity for highlighter
          opacity: activeTool === "highlighter" ? 0.5 : opacity,
        }
        setCurrentShape(newPath)
      } else if (activeTool === "eraser") {
        // For eraser, we'll track the path but handle the actual erasing in mouseMove
        const newPath = {
          id: Date.now().toString(),
          type: "eraser",
          points: [{ x: snappedX, y: snappedY }],
          strokeWidth: strokeWidth * 2,
        }
        setCurrentShape(newPath)
      } else if (activeTool === "text") {
        // Create text input at position
        createTextEditor(snappedX, snappedY)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { x, y } = getCanvasPoint(e)
      const snappedX = snapToGridPoint(x)
      const snappedY = snapToGridPoint(y)

      // Handle resizing
      if (resizing && selectedObject) {
        handleResize(snappedX, snappedY)
        redrawCanvas()
        return
      }

      // Handle dragging
      if (isDragging && selectedObject) {
        const newX = snappedX - dragStartX
        const newY = snappedY - dragStartY

        updateSelectedObject({
          ...selectedObject,
          x: newX,
          y: newY,
        })

        redrawCanvas()
        return
      }

      // Handle drawing
      if (!isDrawing) return

      if (activeTool === "pen" || activeTool === "brush" || activeTool === "highlighter") {
        if (currentShape) {
          const updatedShape = {
            ...currentShape,
            points: [...currentShape.points, { x: snappedX, y: snappedY }],
          }
          setCurrentShape(updatedShape)
          redrawCanvas(updatedShape)
        }
      } else if (activeTool === "eraser") {
        if (currentShape) {
          // Add the point to the eraser path for tracking
          const updatedShape = {
            ...currentShape,
            points: [...currentShape.points, { x: snappedX, y: snappedY }],
          }
          setCurrentShape(updatedShape)

          // Find objects that intersect with the eraser
          const eraserWidth = updatedShape.strokeWidth
          const objectsToRemove = []

          // Draw temporary eraser cursor for visual feedback
          const canvas = canvasRef.current
          if (canvas) {
            const ctx = canvas.getContext("2d")
            if (ctx) {
              // Redraw everything first
              redrawCanvas()

              // Then draw the eraser cursor
              ctx.save()
              ctx.scale(zoom, zoom)
              ctx.beginPath()
              ctx.arc(snappedX, snappedY, eraserWidth / 2, 0, Math.PI * 2)
              ctx.strokeStyle = "rgba(0, 0, 0, 0.3)"
              ctx.stroke()
              ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
              ctx.fill()
              ctx.restore()
            }
          }

          // Check each object for intersection with the eraser
          objects.forEach((obj, index) => {
            // Skip if it's not a drawable object or if it's a grid
            if (obj.type === "grid") return

            // Check for intersection based on object type
            let shouldRemove = false

            // For path-based objects (pen, brush, etc.)
            if (obj.points && Array.isArray(obj.points)) {
              for (const point of obj.points) {
                // Check distance from current eraser segment
                if (currentShape.points.length >= 2) {
                  const lastPoint = currentShape.points[currentShape.points.length - 2]
                  const distance = distanceToLine(point.x, point.y, lastPoint.x, lastPoint.y, snappedX, snappedY)
                  if (distance <= eraserWidth / 2 + (obj.strokeWidth || 2) / 2) {
                    shouldRemove = true
                    break
                  }
                }

                // Also check direct point distance
                const distance = Math.sqrt(Math.pow(point.x - snappedX, 2) + Math.pow(point.y - snappedY, 2))
                if (distance <= eraserWidth / 2) {
                  shouldRemove = true
                  break
                }
              }
            }
            // For shapes and other objects
            else {
              // For simple shapes, check if eraser point is inside or near the object
              if (isPointInObject(snappedX, snappedY, obj)) {
                shouldRemove = true
              }
              // For line objects, check distance to the line
              else if (obj.type === "line" || obj.type === "arrow" || obj.type === "doubleArrow") {
                const distance = distanceToLine(snappedX, snappedY, obj.x, obj.y, obj.x2, obj.y2)
                if (distance <= eraserWidth / 2 + (obj.strokeWidth || 2) / 2) {
                  shouldRemove = true
                }
              }
              // For rectangle, ellipse, check if eraser intersects with the border
              else if (obj.type === "rectangle" || obj.type === "ellipse") {
                // Check if eraser is near any of the four edges
                const edges = [
                  { x1: obj.x, y1: obj.y, x2: obj.x + obj.width, y2: obj.y }, // top
                  { x1: obj.x, y1: obj.y + obj.height, x2: obj.x + obj.width, y2: obj.y + obj.height }, // bottom
                  { x1: obj.x, y1: obj.y, x2: obj.x, y2: obj.y + obj.height }, // left
                  { x1: obj.x + obj.width, y1: obj.y, x2: obj.x + obj.width, y2: obj.y + obj.height }, // right
                ]

                for (const edge of edges) {
                  const distance = distanceToLine(snappedX, snappedY, edge.x1, edge.y1, edge.x2, edge.y2)
                  if (distance <= eraserWidth / 2 + (obj.strokeWidth || 2) / 2) {
                    shouldRemove = true
                    break
                  }
                }
              }
            }

            if (shouldRemove) {
              objectsToRemove.push(index)
            }
          })

          // Remove the objects that intersect with the eraser
          if (objectsToRemove.length > 0) {
            const newObjects = objects.filter((_, index) => !objectsToRemove.includes(index))
            setObjects(newObjects)
          }
        }
      } else if (activeTool === "rectangle" || activeTool === "ellipse") {
        const width = Math.abs(snappedX - startX)
        const height = Math.abs(snappedY - startY)

        // Calculate the top-left corner regardless of drawing direction
        const x = snappedX < startX ? snappedX : startX
        const y = snappedY < startY ? snappedY : startY

        const updatedShape = {
          id: Date.now().toString(),
          type: activeTool,
          x: x,
          y: y,
          width,
          height,
          strokeWidth,
          strokeColor,
          fillColor,
          opacity,
        }

        setCurrentShape(updatedShape)
        redrawCanvas(updatedShape)
      } else if (activeTool === "circle") {
        const radius = Math.sqrt(Math.pow(snappedX - startX, 2) + Math.pow(snappedY - startY, 2))

        const updatedShape = {
          id: Date.now().toString(),
          type: "circle",
          x: startX,
          y: startY,
          radius,
          strokeWidth,
          strokeColor,
          fillColor,
          opacity,
        }

        setCurrentShape(updatedShape)
        redrawCanvas(updatedShape)
      } else if (activeTool === "line" || activeTool === "arrow" || activeTool === "doubleArrow") {
        const updatedShape = {
          id: Date.now().toString(),
          type: activeTool,
          x: startX,
          y: startY,
          x2: snappedX,
          y2: snappedY,
          strokeWidth,
          strokeColor,
          opacity,
        }

        setCurrentShape(updatedShape)
        redrawCanvas(updatedShape)
      } else if (activeTool === "triangle") {
        const updatedShape = {
          id: Date.now().toString(),
          type: "triangle",
          x: startX,
          y: startY,
          x2: snappedX,
          y2: snappedY,
          x3: startX - (snappedX - startX),
          y3: snappedY,
          strokeWidth,
          strokeColor,
          fillColor,
          opacity,
        }

        setCurrentShape(updatedShape)
        redrawCanvas(updatedShape)
      } else if (activeTool === "hexagon" || activeTool === "star") {
        const radius = Math.sqrt(Math.pow(snappedX - startX, 2) + Math.pow(snappedY - startY, 2))

        const updatedShape = {
          id: Date.now().toString(),
          type: activeTool,
          x: startX,
          y: startY,
          radius,
          strokeWidth,
          strokeColor,
          fillColor,
          opacity,
        }

        setCurrentShape(updatedShape)
        redrawCanvas(updatedShape)
      }
    }

    const handleMouseUp = () => {
      if (resizing) {
        setResizing(false)
        setResizeHandle("")
        return
      }

      if (isDragging) {
        setIsDragging(false)
        return
      }

      if (!isDrawing) return

      setIsDrawing(false)

      if (currentShape) {
        if (activeTool !== "eraser") {
          addObject(currentShape)
          setSelectedObject(currentShape)
        }
        setCurrentShape(null)

        // Switch back to select tool after drawing
        if (activeTool !== "pen" && activeTool !== "brush" && activeTool !== "highlighter" && activeTool !== "eraser") {
          setActiveTool("select")
        }
      }
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mouseleave", handleMouseUp)

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("mouseleave", handleMouseUp)
    }
  }, [
    activeTool,
    isDrawing,
    startX,
    startY,
    strokeWidth,
    strokeColor,
    fillColor,
    opacity,
    zoom,
    addObject,
    currentShape,
    objects,
    selectedObject,
    isDragging,
    dragStartX,
    dragStartY,
    resizing,
    resizeHandle,
    snapToGrid,
    gridSize,
    setSelectedObject,
    clearSelection,
    updateSelectedObject,
    createTextEditor,
    setActiveTool,
    setObjects,
  ])

  // Add touch event support to the canvas component
  // Add this after the existing mouse event handlers useEffect

  // Handle touch events for mobile devices
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let lastTouchX = 0
    let lastTouchY = 0
    let isPinching = false
    let startDistance = 0
    let startZoom = zoom

    const getCanvasTouch = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      const x = (touch.clientX - rect.left) / zoom
      const y = (touch.clientY - rect.top) / zoom
      return { x, y }
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Single touch - drawing or selecting
        const { x, y } = getCanvasTouch(e)
        const snappedX = snapToGridPoint(x)
        const snappedY = snapToGridPoint(y)

        // Handle image upload tool
        if (activeTool === "image") {
          if (fileInputRef.current) {
            fileInputRef.current.click()
          }
          return
        }

        // Handle sticker tool
        if (activeTool === "sticker") {
          setStickerPosition({ x: snappedX, y: snappedY })
          setShowStickerPicker(true)
          return
        }

        // Check if touching a selected object's resize handle
        if (selectedObject) {
          const handle = getResizeHandleUnderMouse(x, y)
          if (handle) {
            setResizing(true)
            setResizeHandle(handle)
            return
          }

          // Check if touching a selected object to drag
          if (isPointInObject(x, y, selectedObject)) {
            setIsDragging(true)
            setDragStartX(x - selectedObject.x)
            setDragStartY(y - selectedObject.y)
            return
          }
        }

        // Check if touching any object to select
        if (activeTool === "select") {
          for (let i = objects.length - 1; i >= 0; i--) {
            if (isPointInObject(x, y, objects[i])) {
              setSelectedObject(objects[i])
              setIsDragging(true)
              setDragStartX(x - objects[i].x)
              setDragStartY(y - objects[i].y)
              return
            }
          }
          // If touched on empty space, clear selection
          clearSelection()
          return
        }

        // Start drawing
        setIsDrawing(true)
        setStartX(snappedX)
        setStartY(snappedY)

        if (activeTool === "pen" || activeTool === "brush" || activeTool === "highlighter") {
          const newPath = {
            id: Date.now().toString(),
            type: activeTool,
            points: [{ x: snappedX, y: snappedY }],
            strokeWidth:
              activeTool === "brush" ? strokeWidth * 1.5 : activeTool === "highlighter" ? strokeWidth * 3 : strokeWidth,
            strokeColor: activeTool === "highlighter" ? `${strokeColor}80` : strokeColor,
            opacity: activeTool === "highlighter" ? 0.5 : opacity,
          }
          setCurrentShape(newPath)
        } else if (activeTool === "eraser") {
          // For eraser, we'll track the path but handle the actual erasing in touchMove
          const newPath = {
            id: Date.now().toString(),
            type: "eraser",
            points: [{ x: snappedX, y: snappedY }],
            strokeWidth: strokeWidth * 2,
          }
          setCurrentShape(newPath)
        } else if (activeTool === "text") {
          // Create text input at position
          createTextEditor(snappedX, snappedY)
        }

        lastTouchX = x
        lastTouchY = y
      } else if (e.touches.length === 2) {
        // Pinch to zoom
        isPinching = true
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        startDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
        startZoom = zoom
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault() // Prevent scrolling while drawing

      if (e.touches.length === 2 && isPinching) {
        // Handle pinch zoom
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
        const newZoom = startZoom * (currentDistance / startDistance)

        // Limit zoom range
        if (newZoom >= 0.5 && newZoom <= 3) {
          // Update zoom in the whiteboard context
          // This is a simplified approach - ideally we would update through the context
          redrawCanvas()
        }
        return
      }

      const { x, y } = getCanvasTouch(e)
      const snappedX = snapToGridPoint(x)
      const snappedY = snapToGridPoint(y)

      // Handle resizing
      if (resizing && selectedObject) {
        handleResize(snappedX, snappedY)
        redrawCanvas()
        return
      }

      // Handle dragging
      if (isDragging && selectedObject) {
        const newX = snappedX - dragStartX
        const newY = snappedY - dragStartY

        updateSelectedObject({
          ...selectedObject,
          x: newX,
          y: newY,
        })

        redrawCanvas()
        return
      }

      // Handle drawing
      if (!isDrawing) return

      if (activeTool === "pen" || activeTool === "brush" || activeTool === "highlighter") {
        if (currentShape) {
          const updatedShape = {
            ...currentShape,
            points: [...currentShape.points, { x: snappedX, y: snappedY }],
          }
          setCurrentShape(updatedShape)
          redrawCanvas(updatedShape)
        }
      } else if (activeTool === "eraser") {
        if (currentShape) {
          // Add the point to the eraser path for tracking
          const updatedShape = {
            ...currentShape,
            points: [...currentShape.points, { x: snappedX, y: snappedY }],
          }
          setCurrentShape(updatedShape)

          // Find objects that intersect with the eraser
          const eraserWidth = updatedShape.strokeWidth
          const objectsToRemove = []

          // Draw temporary eraser cursor for visual feedback
          const canvas = canvasRef.current
          if (canvas) {
            const ctx = canvas.getContext("2d")
            if (ctx) {
              // Redraw everything first
              redrawCanvas()

              // Then draw the eraser cursor
              ctx.save()
              ctx.scale(zoom, zoom)
              ctx.beginPath()
              ctx.arc(snappedX, snappedY, eraserWidth / 2, 0, Math.PI * 2)
              ctx.strokeStyle = "rgba(0, 0, 0, 0.3)"
              ctx.stroke()
              ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
              ctx.fill()
              ctx.restore()
            }
          }

          // Check each object for intersection with the eraser
          objects.forEach((obj, index) => {
            // Skip if it's not a drawable object or if it's a grid
            if (obj.type === "grid") return

            // Check for intersection based on object type
            let shouldRemove = false

            // For path-based objects (pen, brush, etc.)
            if (obj.points && Array.isArray(obj.points)) {
              for (const point of obj.points) {
                // Check distance from current eraser segment
                if (currentShape.points.length >= 2) {
                  const lastPoint = currentShape.points[currentShape.points.length - 2]
                  const distance = distanceToLine(point.x, point.y, lastPoint.x, lastPoint.y, snappedX, snappedY)
                  if (distance <= eraserWidth / 2 + (obj.strokeWidth || 2) / 2) {
                    shouldRemove = true
                    break
                  }
                }

                // Also check direct point distance
                const distance = Math.sqrt(Math.pow(point.x - snappedX, 2) + Math.pow(point.y - snappedY, 2))
                if (distance <= eraserWidth / 2) {
                  shouldRemove = true
                  break
                }
              }
            }
            // For shapes and other objects
            else {
              // For simple shapes, check if eraser point is inside or near the object
              if (isPointInObject(snappedX, snappedY, obj)) {
                shouldRemove = true
              }
              // For line objects, check distance to the line
              else if (obj.type === "line" || obj.type === "arrow" || obj.type === "doubleArrow") {
                const distance = distanceToLine(snappedX, snappedY, obj.x, obj.y, obj.x2, obj.y2)
                if (distance <= eraserWidth / 2 + (obj.strokeWidth || 2) / 2) {
                  shouldRemove = true
                }
              }
              // For rectangle, ellipse, check if eraser intersects with the border
              else if (obj.type === "rectangle" || obj.type === "ellipse") {
                // Check if eraser is near any of the four edges
                const edges = [
                  { x1: obj.x, y1: obj.y, x2: obj.x + obj.width, y2: obj.y }, // top
                  { x1: obj.x, y1: obj.y + obj.height, x2: obj.x + obj.width, y2: obj.y + obj.height }, // bottom
                  { x1: obj.x, y1: obj.y, x2: obj.x, y2: obj.y + obj.height }, // left
                  { x1: obj.x + obj.width, y1: obj.y, x2: obj.x + obj.width, y2: obj.y + obj.height }, // right
                ]

                for (const edge of edges) {
                  const distance = distanceToLine(snappedX, snappedY, edge.x1, edge.y1, edge.x2, edge.y2)
                  if (distance <= eraserWidth / 2 + (obj.strokeWidth || 2) / 2) {
                    shouldRemove = true
                    break
                  }
                }
              }
            }

            if (shouldRemove) {
              objectsToRemove.push(index)
            }
          })

          // Remove the objects that intersect with the eraser
          if (objectsToRemove.length > 0) {
            const newObjects = objects.filter((_, index) => !objectsToRemove.includes(index))
            setObjects(newObjects)
          }
        }
      } else if (activeTool === "rectangle" || activeTool === "ellipse") {
        const width = Math.abs(snappedX - startX)
        const height = Math.abs(snappedY - startY)

        // Calculate the top-left corner regardless of drawing direction
        const x = snappedX < startX ? snappedX : startX
        const y = snappedY < startY ? snappedY : startY

        const updatedShape = {
          id: Date.now().toString(),
          type: activeTool,
          x: x,
          y: y,
          width,
          height,
          strokeWidth,
          strokeColor,
          fillColor,
          opacity,
        }

        setCurrentShape(updatedShape)
        redrawCanvas(updatedShape)
      } else if (activeTool === "circle") {
        const radius = Math.sqrt(Math.pow(snappedX - startX, 2) + Math.pow(snappedY - startY, 2))

        const updatedShape = {
          id: Date.now().toString(),
          type: "circle",
          x: startX,
          y: startY,
          radius,
          strokeWidth,
          strokeColor,
          fillColor,
          opacity,
        }

        setCurrentShape(updatedShape)
        redrawCanvas(updatedShape)
      } else if (activeTool === "line" || activeTool === "arrow" || activeTool === "doubleArrow") {
        const updatedShape = {
          id: Date.now().toString(),
          type: activeTool,
          x: startX,
          y: startY,
          x2: snappedX,
          y2: snappedY,
          strokeWidth,
          strokeColor,
          opacity,
        }

        setCurrentShape(updatedShape)
        redrawCanvas(updatedShape)
      } else if (activeTool === "triangle") {
        const updatedShape = {
          id: Date.now().toString(),
          type: "triangle",
          x: startX,
          y: startY,
          x2: snappedX,
          y2: snappedY,
          x3: startX - (snappedX - startX),
          y3: snappedY,
          strokeWidth,
          strokeColor,
          fillColor,
          opacity,
        }

        setCurrentShape(updatedShape)
        redrawCanvas(updatedShape)
      } else if (activeTool === "hexagon" || activeTool === "star") {
        const radius = Math.sqrt(Math.pow(snappedX - startX, 2) + Math.pow(snappedY - startY, 2))

        const updatedShape = {
          id: Date.now().toString(),
          type: activeTool,
          x: startX,
          y: startY,
          radius,
          strokeWidth,
          strokeColor,
          fillColor,
          opacity,
        }

        setCurrentShape(updatedShape)
        redrawCanvas(updatedShape)
      }

      lastTouchX = x
      lastTouchY = y
    }

    const handleTouchEnd = (e: TouchEvent) => {
      isPinching = false

      if (resizing) {
        setResizing(false)
        setResizeHandle("")
        return
      }

      if (isDragging) {
        setIsDragging(false)
        return
      }

      if (!isDrawing) return

      setIsDrawing(false)

      if (currentShape) {
        if (activeTool !== "eraser") {
          addObject(currentShape)
          setSelectedObject(currentShape)
        }
        setCurrentShape(null)

        // Switch back to select tool after drawing
        if (activeTool !== "pen" && activeTool !== "brush" && activeTool !== "highlighter" && activeTool !== "eraser") {
          setActiveTool("select")
        }
      }
    }

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd)

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [
    activeTool,
    isDrawing,
    startX,
    startY,
    strokeWidth,
    strokeColor,
    fillColor,
    opacity,
    zoom,
    addObject,
    currentShape,
    objects,
    selectedObject,
    isDragging,
    dragStartX,
    dragStartY,
    resizing,
    resizeHandle,
    snapToGrid,
    gridSize,
    setSelectedObject,
    clearSelection,
    updateSelectedObject,
    createTextEditor,
    setActiveTool,
    redrawCanvas,
    setObjects,
  ])

  // Handle resize of selected object
  const handleResize = (x: number, y: number) => {
    if (!selectedObject) return

    const updatedObject = { ...selectedObject }

    switch (resizeHandle) {
      case "top-left":
        if (
          selectedObject.type === "rectangle" ||
          selectedObject.type === "ellipse" ||
          selectedObject.type === "image" ||
          selectedObject.type === "sticker"
        ) {
          const newWidth = selectedObject.x + selectedObject.width - x
          const newHeight = selectedObject.y + selectedObject.height - y
          if (newWidth > 0 && newHeight > 0) {
            updatedObject.x = x
            updatedObject.y = y
            updatedObject.width = newWidth
            updatedObject.height = newHeight
          }
        }
        break
      case "top-right":
        if (
          selectedObject.type === "rectangle" ||
          selectedObject.type === "ellipse" ||
          selectedObject.type === "image" ||
          selectedObject.type === "sticker"
        ) {
          const newWidth = x - selectedObject.x
          const newHeight = selectedObject.y + selectedObject.height - y
          if (newWidth > 0 && newHeight > 0) {
            updatedObject.y = y
            updatedObject.width = newWidth
            updatedObject.height = newHeight
          }
        }
        break
      case "bottom-left":
        if (
          selectedObject.type === "rectangle" ||
          selectedObject.type === "ellipse" ||
          selectedObject.type === "image" ||
          selectedObject.type === "sticker"
        ) {
          const newWidth = selectedObject.x + selectedObject.width - x
          const newHeight = y - selectedObject.y
          if (newWidth > 0 && newHeight > 0) {
            updatedObject.x = x
            updatedObject.width = newWidth
            updatedObject.height = newHeight
          }
        }
        break
      case "bottom-right":
        if (
          selectedObject.type === "rectangle" ||
          selectedObject.type === "ellipse" ||
          selectedObject.type === "image" ||
          selectedObject.type === "sticker"
        ) {
          const newWidth = x - selectedObject.x
          const newHeight = y - selectedObject.y
          if (newWidth > 0 && newHeight > 0) {
            updatedObject.width = newWidth
            updatedObject.height = newHeight
          }
        } else if (
          selectedObject.type === "circle" ||
          selectedObject.type === "hexagon" ||
          selectedObject.type === "star"
        ) {
          const radius = Math.sqrt(Math.pow(x - selectedObject.x, 2) + Math.pow(y - selectedObject.y, 2))
          updatedObject.radius = radius
        } else if (
          selectedObject.type === "line" ||
          selectedObject.type === "arrow" ||
          selectedObject.type === "doubleArrow"
        ) {
          updatedObject.x2 = x
          updatedObject.y2 = y
        } else if (selectedObject.type === "triangle") {
          updatedObject.x2 = x
          updatedObject.y2 = y
          updatedObject.x3 = selectedObject.x - (x - selectedObject.x)
          updatedObject.y3 = y
        }
        break
    }

    updateSelectedObject(updatedObject)
  }

  // Check if a point is inside an object
  const isPointInObject = (x: number, y: number, object: any) => {
    if (!object) return false

    switch (object.type) {
      case "rectangle":
      case "ellipse":
      case "image":
      case "sticker":
        return x >= object.x && x <= object.x + object.width && y >= object.y && y <= object.y + object.height
      case "circle":
      case "hexagon":
      case "star":
        const distance = Math.sqrt(Math.pow(x - object.x, 2) + Math.pow(y - object.y, 2))
        return distance <= object.radius
      case "line":
      case "arrow":
      case "doubleArrow":
        // Check if point is close to the line
        const lineDistance = distanceToLine(x, y, object.x, object.y, object.x2, object.y2)
        return lineDistance <= 5 // 5px tolerance
      case "triangle":
        // Check if point is inside triangle
        return isPointInTriangle(x, y, object.x, object.y, object.x2, object.y2, object.x3, object.y3)
      case "text":
        // Better text selection - calculate actual text dimensions
        const textWidth = object.text.length * (object.fontSize || 16) * 0.6
        const textHeight = (object.fontSize || 16) * 1.2
        return x >= object.x && x <= object.x + textWidth && y >= object.y - textHeight && y <= object.y
      case "pen":
      case "eraser":
      case "brush":
      case "highlighter":
        // Check if point is close to any segment of the path
        if (!object.points || object.points.length < 2) return false
        for (let i = 1; i < object.points.length; i++) {
          const lineDistance = distanceToLine(
            x,
            y,
            object.points[i - 1].x,
            object.points[i - 1].y,
            object.points[i].x,
            object.points[i].y,
          )
          if (lineDistance <= object.strokeWidth / 2) return true
        }
        return false
      default:
        return false
    }
  }

  // Check if point is inside triangle
  const isPointInTriangle = (
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
  ) => {
    const area = 0.5 * Math.abs(x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2))
    const area1 = 0.5 * Math.abs(px * (y1 - y2) + x1 * (y2 - py) + x2 * (py - y1))
    const area2 = 0.5 * Math.abs(px * (y2 - y3) + x2 * (y3 - py) + x3 * (py - y2))
    const area3 = 0.5 * Math.abs(px * (y3 - y1) + x3 * (y1 - py) + x1 * (py - y3))
    return Math.abs(area - (area1 + area2 + area3)) < 0.01
  }

  // Calculate distance from point to line segment
  const distanceToLine = (x: number, y: number, x1: number, y1: number, x2: number, y2: number) => {
    const A = x - x1
    const B = y - y1
    const C = x2 - x1
    const D = y2 - y1

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1

    if (lenSq !== 0) param = dot / lenSq

    let xx, yy

    if (param < 0) {
      xx = x1
      yy = y1
    } else if (param > 1) {
      xx = x2
      yy = y2
    } else {
      xx = x1 + param * C
      yy = y1 + param * D
    }

    const dx = x - xx
    const dy = y - yy
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Get resize handle under mouse
  const getResizeHandleUnderMouse = (x: number, y: number) => {
    if (!selectedObject) return ""

    const handleSize = 8 / zoom

    if (
      selectedObject.type === "rectangle" ||
      selectedObject.type === "ellipse" ||
      selectedObject.type === "image" ||
      selectedObject.type === "sticker"
    ) {
      // Top-left
      if (
        x >= selectedObject.x - handleSize &&
        x <= selectedObject.x + handleSize &&
        y >= selectedObject.y - handleSize &&
        y <= selectedObject.y + handleSize
      ) {
        return "top-left"
      }

      // Top-right
      if (
        x >= selectedObject.x + selectedObject.width - handleSize &&
        x <= selectedObject.x + selectedObject.width + handleSize &&
        y >= selectedObject.y - handleSize &&
        y <= selectedObject.y + handleSize
      ) {
        return "top-right"
      }

      // Bottom-left
      if (
        x >= selectedObject.x - handleSize &&
        x <= selectedObject.x + handleSize &&
        y >= selectedObject.y + selectedObject.height - handleSize &&
        y <= selectedObject.y + selectedObject.height + handleSize
      ) {
        return "bottom-left"
      }

      // Bottom-right
      if (
        x >= selectedObject.x + selectedObject.width - handleSize &&
        x <= selectedObject.x + selectedObject.width + handleSize &&
        y >= selectedObject.y + selectedObject.height - handleSize &&
        y <= selectedObject.y + selectedObject.height + handleSize
      ) {
        return "bottom-right"
      }
    } else if (
      selectedObject.type === "circle" ||
      selectedObject.type === "hexagon" ||
      selectedObject.type === "star"
    ) {
      // For circle, only bottom-right handle to resize
      const angle = Math.atan2(selectedObject.y - y, selectedObject.x - x + selectedObject.radius)
      const handleX = selectedObject.x + selectedObject.radius * Math.cos(angle)
      const handleY = selectedObject.y + selectedObject.radius * Math.sin(angle)

      if (
        x >= handleX - handleSize &&
        x <= handleX + handleSize &&
        y >= handleY - handleSize &&
        y <= handleY + handleSize
      ) {
        return "bottom-right"
      }
    } else if (
      selectedObject.type === "line" ||
      selectedObject.type === "arrow" ||
      selectedObject.type === "doubleArrow"
    ) {
      // For line, resize the end point
      if (
        x >= selectedObject.x2 - handleSize &&
        x <= selectedObject.x2 + handleSize &&
        y >= selectedObject.y2 - handleSize &&
        y <= selectedObject.y2 + handleSize
      ) {
        return "bottom-right"
      }
    } else if (selectedObject.type === "triangle") {
      // For triangle, resize the second point
      if (
        x >= selectedObject.x2 - handleSize &&
        x <= selectedObject.x2 + handleSize &&
        y >= selectedObject.y2 - handleSize &&
        y <= selectedObject.y2 + handleSize
      ) {
        return "bottom-right"
      }
    }

    return ""
  }

  // Draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const width = ctx.canvas.width / window.devicePixelRatio
    const height = ctx.canvas.height / window.devicePixelRatio
    const isDarkMode = document.documentElement.classList.contains("dark")

    ctx.save()
    ctx.strokeStyle = isDarkMode ? "#333333" : "#e5e5e5"
    ctx.lineWidth = 0.5

    const step = gridSize * zoom

    for (let x = 0; x < width; x += step) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    for (let y = 0; y < height; y += step) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    ctx.restore()
  }

  // Draw an object
  const drawObject = (ctx: CanvasRenderingContext2D, object: any) => {
    if (!object) return

    ctx.globalAlpha = object.opacity !== undefined ? object.opacity : 1

    switch (object.type) {
      case "rectangle":
        ctx.beginPath()
        ctx.rect(object.x, object.y, object.width, object.height)
        if (object.fillColor && object.fillColor !== "transparent") {
          ctx.fillStyle = object.fillColor
          ctx.fill()
        }
        ctx.lineWidth = object.strokeWidth
        ctx.strokeStyle = object.strokeColor
        ctx.stroke()
        break
      case "ellipse":
        ctx.beginPath()
        ctx.ellipse(
          object.x + object.width / 2,
          object.y + object.height / 2,
          Math.abs(object.width / 2),
          Math.abs(object.height / 2),
          0,
          0,
          2 * Math.PI,
        )
        if (object.fillColor && object.fillColor !== "transparent") {
          ctx.fillStyle = object.fillColor
          ctx.fill()
        }
        ctx.lineWidth = object.strokeWidth
        ctx.strokeStyle = object.strokeColor
        ctx.stroke()
        break
      case "circle":
        ctx.beginPath()
        ctx.arc(object.x, object.y, object.radius, 0, 2 * Math.PI)
        if (object.fillColor && object.fillColor !== "transparent") {
          ctx.fillStyle = object.fillColor
          ctx.fill()
        }
        ctx.lineWidth = object.strokeWidth
        ctx.strokeStyle = object.strokeColor
        ctx.stroke()
        break
      case "line":
        ctx.beginPath()
        ctx.moveTo(object.x, object.y)
        ctx.lineTo(object.x2, object.y2)
        ctx.lineWidth = object.strokeWidth
        ctx.strokeStyle = object.strokeColor
        ctx.stroke()
        break
      case "arrow":
        drawArrow(ctx, object.x, object.y, object.x2, object.y2, object.strokeWidth, object.strokeColor)
        break
      case "doubleArrow":
        drawDoubleArrow(ctx, object.x, object.y, object.x2, object.y2, object.strokeWidth, object.strokeColor)
        break
      case "triangle":
        ctx.beginPath()
        ctx.moveTo(object.x, object.y)
        ctx.lineTo(object.x2, object.y2)
        ctx.lineTo(object.x3, object.y3)
        ctx.closePath()
        if (object.fillColor && object.fillColor !== "transparent") {
          ctx.fillStyle = object.fillColor
          ctx.fill()
        }
        ctx.lineWidth = object.strokeWidth
        ctx.strokeStyle = object.strokeColor
        ctx.stroke()
        break
      case "hexagon":
        drawHexagon(ctx, object.x, object.y, object.radius, object.strokeWidth, object.strokeColor, object.fillColor)
        break
      case "star":
        drawStar(ctx, object.x, object.y, object.radius, object.strokeWidth, object.strokeColor, object.fillColor)
        break
      case "text":
        if (!object.text) return
        const fontStyle = object.fontStyle || "normal"
        const fontWeight = object.fontWeight || "normal"
        const textDecoration = object.textDecoration || "none"
        const fontFamily = object.fontFamily || "sans-serif"
        const fontSize = object.fontSize || 16

        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
        ctx.fillStyle = object.strokeColor || "#000000"
        ctx.textBaseline = "alphabetic"

        // Apply text alignment if specified
        if (object.textAlign) {
          ctx.textAlign = object.textAlign
        } else {
          ctx.textAlign = "left"
        }

        ctx.fillText(object.text, object.x, object.y)

        // Draw underline if needed
        if (textDecoration === "underline") {
          const textWidth = ctx.measureText(object.text).width
          ctx.beginPath()
          ctx.moveTo(object.x, object.y + 3)
          ctx.lineTo(object.x + textWidth, object.y + 3)
          ctx.strokeStyle = object.strokeColor || "#000000"
          ctx.lineWidth = 1
          ctx.stroke()
        }

        // Add visual indicator for editable text in templates
        if (object.isEditable) {
          const textWidth = ctx.measureText(object.text).width
          const textHeight = fontSize * 1.2

          // Draw a subtle dotted outline around editable text
          ctx.beginPath()
          ctx.setLineDash([2, 2])
          ctx.rect(object.x - 2, object.y - textHeight + 2, textWidth + 4, textHeight)
          ctx.strokeStyle = "rgba(79, 70, 229, 0.4)" // Light purple color
          ctx.lineWidth = 1
          ctx.stroke()
          ctx.setLineDash([])
        }
        break
      case "image":
      case "sticker":
        const img = images[object.id]
        if (img) {
          ctx.drawImage(img, object.x, object.y, object.width, object.height)
        } else if (object.src) {
          // Load the image if not already loaded
          const newImg = new Image()
          newImg.crossOrigin = "anonymous"
          newImg.onload = () => {
            setImages((prev) => ({
              ...prev,
              [object.id]: newImg,
            }))
          }
          newImg.src = object.src
          ctx.drawImage(newImg, object.x, object.y, object.width, object.height)
        }
        break
      case "pen":
      case "brush":
      case "highlighter":
        ctx.beginPath()
        ctx.moveTo(object.points[0].x, object.points[0].y)
        ctx.lineWidth = object.strokeWidth
        ctx.strokeStyle = object.strokeColor
        ctx.lineCap = "round"
        ctx.lineJoin = "round"

        for (let i = 1; i < object.points.length; i++) {
          ctx.lineTo(object.points[i].x, object.points[i].y)
        }
        ctx.stroke()
        break
      case "eraser":
        // Don't draw the eraser path
        break
    }

    ctx.globalAlpha = 1
  }

  // Draw arrow
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    width: number,
    color: string,
  ) => {
    const headlen = 10
    const dx = toX - fromX
    const dy = toY - fromY
    const angle = Math.atan2(dy, dx)
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.lineWidth = width
    ctx.strokeStyle = color
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(toX, toY)
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6))
    ctx.moveTo(toX, toY)
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6))
    ctx.fillStyle = color
    ctx.fill()
  }

  // Draw double arrow
  const drawDoubleArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    width: number,
    color: string,
  ) => {
    const headlen = 10
    const dx = toX - fromX
    const dy = toY - fromY
    const angle = Math.atan2(dy, dx)

    // Draw the line
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.lineWidth = width
    ctx.strokeStyle = color
    ctx.stroke()

    // Draw the arrow head at the end
    ctx.beginPath()
    ctx.moveTo(toX, toY)
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6))
    ctx.moveTo(toX, toY)
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6))
    ctx.fillStyle = color
    ctx.fill()

    // Draw the arrow head at the start
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(fromX + headlen * Math.cos(angle - Math.PI / 6), fromY + headlen * Math.sin(angle - Math.PI / 6))
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(fromX + headlen * Math.cos(angle + Math.PI / 6), fromY + headlen * Math.sin(angle + Math.PI / 6))
    ctx.fillStyle = color
    ctx.fill()
  }

  // Draw hexagon
  const drawHexagon = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    strokeWidth: number,
    strokeColor: string,
    fillColor: string,
  ) => {
    const numberOfSides = 6
    ctx.beginPath()
    ctx.moveTo(x + radius * Math.cos(0), y + radius * Math.sin(0))
    for (let i = 1; i <= numberOfSides; i++) {
      ctx.lineTo(
        x + radius * Math.cos((i * 2 * Math.PI) / numberOfSides),
        y + radius * Math.sin((i * 2 * Math.PI) / numberOfSides),
      )
    }
    ctx.closePath()
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = strokeColor
    if (fillColor && fillColor !== "transparent") {
      ctx.fillStyle = fillColor
      ctx.fill()
    }
    ctx.stroke()
  }

  // Draw star
  const drawStar = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    strokeWidth: number,
    strokeColor: string,
    fillColor: string,
  ) => {
    const spikes = 5
    const outerRadius = radius
    const innerRadius = radius / 2
    let rot = (Math.PI / 2) * 3
    let cx = x
    let cy = y
    const step = Math.PI / spikes

    ctx.beginPath()
    ctx.moveTo(cx + outerRadius * Math.cos(rot), cy + outerRadius * Math.sin(rot))
    for (let i = 0; i < spikes; i++) {
      cx = x
      cy = y
      rot += step

      ctx.lineTo(cx + innerRadius * Math.cos(rot), cy + innerRadius * Math.sin(rot))

      rot += step

      ctx.lineTo(cx + outerRadius * Math.cos(rot), cy + outerRadius * Math.sin(rot))
    }
    ctx.closePath()
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = strokeColor
    if (fillColor && fillColor !== "transparent") {
      ctx.fillStyle = fillColor
      ctx.fill()
    }
    ctx.stroke()
  }

  // Draw selection handles
  const drawSelectionHandles = (ctx: CanvasRenderingContext2D, object: any) => {
    if (!object) return

    const handleSize = 8 / zoom

    ctx.save()
    ctx.strokeStyle = "#4f46e5"
    ctx.fillStyle = "#ffffff"
    ctx.lineWidth = 1 / zoom

    if (
      object.type === "rectangle" ||
      object.type === "ellipse" ||
      object.type === "image" ||
      object.type === "sticker"
    ) {
      // Top-left handle
      ctx.beginPath()
      ctx.rect(object.x - handleSize, object.y - handleSize, handleSize * 2, handleSize * 2)
      ctx.stroke()
      ctx.fill()

      // Top-right handle
      ctx.beginPath()
      ctx.rect(object.x + object.width - handleSize, object.y - handleSize, handleSize * 2, handleSize * 2)
      ctx.stroke()
      ctx.fill()

      // Bottom-left handle
      ctx.beginPath()
      ctx.rect(object.x - handleSize, object.y + object.height - handleSize, handleSize * 2, handleSize * 2)
      ctx.stroke()
      ctx.fill()

      // Bottom-right handle
      ctx.beginPath()
      ctx.rect(
        object.x + object.width - handleSize,
        object.y + object.height - handleSize,
        handleSize * 2,
        handleSize * 2,
      )
      ctx.stroke()
      ctx.fill()
    } else if (object.type === "circle" || object.type === "hexagon" || object.type === "star") {
      // Bottom-right handle for circle
      const angle = Math.atan2(object.y - object.y, object.x - object.x + object.radius)
      const handleX = object.x + object.radius * Math.cos(angle)
      const handleY = object.y + object.radius * Math.sin(angle)

      ctx.beginPath()
      ctx.arc(handleX, handleY, handleSize, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.fill()
    } else if (object.type === "line" || object.type === "arrow" || object.type === "doubleArrow") {
      // Bottom-right handle for line
      ctx.beginPath()
      ctx.arc(object.x2, object.y2, handleSize, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.fill()
    } else if (object.type === "triangle") {
      // Bottom-right handle for triangle
      ctx.beginPath()
      ctx.arc(object.x2, object.y2, handleSize, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.fill()
    }

    ctx.restore()
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden" ref={containerRef}>
      <canvas ref={canvasRef} className="absolute cursor-crosshair" />
      {showStickerPicker && (
        <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white p-4 shadow-md">
          <div className="mb-2 text-sm font-medium">Select a Sticker</div>
          <div className="flex flex-wrap gap-2">
            {[
              "/stickers/like.png",
              "/stickers/love.png",
              "/stickers/haha.png",
              "/stickers/wow.png",
              "/stickers/sad.png",
              "/stickers/angry.png",
            ].map((stickerUrl) => (
              <img
                key={stickerUrl}
                src={stickerUrl || "/placeholder.svg"}
                alt="Sticker"
                className="h-10 w-10 cursor-pointer rounded-md object-contain p-1 hover:bg-gray-100"
                onClick={() => handleStickerSelect(stickerUrl)}
              />
            ))}
          </div>
          <button
            className="mt-3 block w-full rounded-md border border-gray-300 bg-gray-50 py-2 text-center text-xs font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => setShowStickerPicker(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
