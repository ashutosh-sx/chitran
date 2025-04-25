"use client"

import { createContext, useContext, useState, type ReactNode, useCallback, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface WhiteboardObject {
  id: string
  type: string
  [key: string]: any
}

interface WhiteboardContextType {
  activeTool: string
  setActiveTool: (tool: string) => void
  strokeWidth: number
  setStrokeWidth: (width: number) => void
  strokeColor: string
  setStrokeColor: (color: string) => void
  fillColor: string
  setFillColor: (color: string) => void
  opacity: number
  setOpacity: (opacity: number) => void
  zoom: number
  zoomIn: () => void
  zoomOut: () => void
  selectedObject: WhiteboardObject | null
  setSelectedObject: (object: WhiteboardObject | null) => void
  objects: WhiteboardObject[]
  setObjects: (objects: WhiteboardObject[]) => void
  addObject: (object: WhiteboardObject) => void
  addObjects: (objects: WhiteboardObject[]) => void
  updateSelectedObject: (object: WhiteboardObject) => void
  deleteSelectedObject: () => void
  duplicateSelectedObject: () => void
  clearSelection: () => void
  clearCanvas: () => void
  history: WhiteboardObject[][]
  historyIndex: number
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  exportCanvas: (format: string) => void
  saveCanvas: () => void
  showGrid: boolean
  toggleGrid: () => void
  snapToGrid: boolean
  toggleSnapToGrid: () => void
  gridSize: number
  bringToFront: () => void
  sendToBack: () => void
  bringForward: () => void
  sendBackward: () => void
  applyTemplate: (templateName: string) => void
}

const WhiteboardContext = createContext<WhiteboardContextType | undefined>(undefined)

export function WhiteboardProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [activeTool, setActiveTool] = useState("select")
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [fillColor, setFillColor] = useState("transparent")
  const [opacity, setOpacity] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [selectedObject, setSelectedObject] = useState<WhiteboardObject | null>(null)
  const [objects, setObjects] = useState<WhiteboardObject[]>([])
  const [history, setHistory] = useState<WhiteboardObject[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showGrid, setShowGrid] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(false)
  const [gridSize, setGridSize] = useState(20)

  // Initialize with empty canvas
  useEffect(() => {
    setObjects([])
    setHistory([[]])
  }, [])

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.1, 3))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }, [])

  const addObject = useCallback(
    (object: WhiteboardObject) => {
      const newObjects = [...objects, object]
      setObjects(newObjects)

      // Add to history
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push([...newObjects])
      setHistory(newHistory)
      setHistoryIndex(historyIndex + 1)
    },
    [objects, history, historyIndex],
  )

  const addObjects = useCallback(
    (newObjectsToAdd: WhiteboardObject[]) => {
      const newObjects = [...objects, ...newObjectsToAdd]
      setObjects(newObjects)

      // Add to history
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push([...newObjects])
      setHistory(newHistory)
      setHistoryIndex(historyIndex + 1)
    },
    [objects, history, historyIndex],
  )

  const updateSelectedObject = useCallback(
    (updatedObject: WhiteboardObject) => {
      if (!selectedObject) return

      const newObjects = objects.map((obj) => (obj.id === updatedObject.id ? updatedObject : obj))

      setObjects(newObjects)
      setSelectedObject(updatedObject)

      // Add to history
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push([...newObjects])
      setHistory(newHistory)
      setHistoryIndex(historyIndex + 1)
    },
    [selectedObject, objects, history, historyIndex],
  )

  const deleteSelectedObject = useCallback(() => {
    if (!selectedObject) return

    const newObjects = objects.filter((obj) => obj.id !== selectedObject.id)
    setObjects(newObjects)
    setSelectedObject(null)

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newObjects])
    setHistory(newHistory)
    setHistoryIndex(historyIndex + 1)
  }, [selectedObject, objects, history, historyIndex])

  const duplicateSelectedObject = useCallback(() => {
    if (!selectedObject) return

    const duplicate = {
      ...selectedObject,
      id: Date.now().toString(),
      x: selectedObject.x + 20,
      y: selectedObject.y + 20,
    }

    const newObjects = [...objects, duplicate]
    setObjects(newObjects)
    setSelectedObject(duplicate)

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newObjects])
    setHistory(newHistory)
    setHistoryIndex(historyIndex + 1)
  }, [selectedObject, objects, history, historyIndex])

  const clearSelection = useCallback(() => {
    setSelectedObject(null)
  }, [])

  const clearCanvas = useCallback(() => {
    setObjects([])
    setSelectedObject(null)

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([])
    setHistory(newHistory)
    setHistoryIndex(historyIndex + 1)

    toast({
      title: "Canvas cleared",
      description: "All objects have been removed from the canvas.",
    })
  }, [history, historyIndex, toast])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setObjects([...history[historyIndex - 1]])
      setSelectedObject(null)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setObjects([...history[historyIndex + 1]])
      setSelectedObject(null)
    }
  }, [history, historyIndex])

  const exportCanvas = useCallback(
    (format: string) => {
      const canvas = document.querySelector("canvas")
      if (!canvas) return

      if (format === "png") {
        const dataUrl = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.download = "whiteboard.png"
        link.href = dataUrl
        link.click()

        toast({
          title: "Export successful",
          description: "Your whiteboard has been exported as PNG.",
        })
      }
    },
    [toast],
  )

  const saveCanvas = useCallback(() => {
    // In a real app, this would save to a server or local storage
    localStorage.setItem("whiteboard-data", JSON.stringify(objects))

    toast({
      title: "Save successful",
      description: "Your whiteboard has been saved.",
    })
  }, [objects, toast])

  const toggleGrid = useCallback(() => {
    setShowGrid((prev) => !prev)
  }, [])

  const toggleSnapToGrid = useCallback(() => {
    setSnapToGrid((prev) => !prev)
  }, [])

  const bringToFront = useCallback(() => {
    if (!selectedObject) return

    const newObjects = objects.filter((obj) => obj.id !== selectedObject.id)
    newObjects.push(selectedObject)

    setObjects(newObjects)

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newObjects])
    setHistory(newHistory)
    setHistoryIndex(historyIndex + 1)
  }, [selectedObject, objects, history, historyIndex])

  const sendToBack = useCallback(() => {
    if (!selectedObject) return

    const newObjects = objects.filter((obj) => obj.id !== selectedObject.id)
    newObjects.unshift(selectedObject)

    setObjects(newObjects)

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newObjects])
    setHistory(newHistory)
    setHistoryIndex(historyIndex + 1)
  }, [selectedObject, objects, history, historyIndex])

  const bringForward = useCallback(() => {
    if (!selectedObject) return

    const index = objects.findIndex((obj) => obj.id === selectedObject.id)
    if (index === objects.length - 1) return // Already at the front

    const newObjects = [...objects]
    const temp = newObjects[index]
    newObjects[index] = newObjects[index + 1]
    newObjects[index + 1] = temp

    setObjects(newObjects)

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newObjects])
    setHistory(newHistory)
    setHistoryIndex(historyIndex + 1)
  }, [selectedObject, objects, history, historyIndex])

  const sendBackward = useCallback(() => {
    if (!selectedObject) return

    const index = objects.findIndex((obj) => obj.id === selectedObject.id)
    if (index === 0) return // Already at the back

    const newObjects = [...objects]
    const temp = newObjects[index]
    newObjects[index] = newObjects[index - 1]
    newObjects[index - 1] = temp

    setObjects(newObjects)

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newObjects])
    setHistory(newHistory)
    setHistoryIndex(historyIndex + 1)
  }, [selectedObject, objects, history, historyIndex])

  // Template application function
  const applyTemplate = useCallback(
    (templateName: string) => {
      let templateObjects: WhiteboardObject[] = []
      const baseId = Date.now().toString()

      switch (templateName) {
        case "UML Diagram":
          templateObjects = [
            // Class boxes
            {
              id: `${baseId}-1`,
              type: "rectangle",
              x: 100,
              y: 100,
              width: 200,
              height: 150,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#f0f9ff",
              opacity: 1,
            },
            {
              id: `${baseId}-2`,
              type: "rectangle",
              x: 400,
              y: 100,
              width: 200,
              height: 150,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#f0f9ff",
              opacity: 1,
            },
            {
              id: `${baseId}-3`,
              type: "rectangle",
              x: 250,
              y: 350,
              width: 200,
              height: 150,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#f0f9ff",
              opacity: 1,
            },
            // Class names - editable text
            {
              id: `${baseId}-4`,
              type: "text",
              x: 150,
              y: 130,
              text: "User",
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            {
              id: `${baseId}-5`,
              type: "text",
              x: 450,
              y: 130,
              text: "Order",
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            {
              id: `${baseId}-6`,
              type: "text",
              x: 300,
              y: 380,
              text: "Product",
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Relationship lines
            {
              id: `${baseId}-7`,
              type: "line",
              x: 300,
              y: 175,
              x2: 400,
              y2: 175,
              strokeWidth: 2,
              strokeColor: "#000000",
              opacity: 1,
            },
            {
              id: `${baseId}-8`,
              type: "line",
              x: 500,
              y: 250,
              x2: 350,
              y2: 350,
              strokeWidth: 2,
              strokeColor: "#000000",
              opacity: 1,
            },
          ]
          break

        case "Flowchart":
          templateObjects = [
            // Start node
            {
              id: `${baseId}-1`,
              type: "ellipse",
              x: 300,
              y: 50,
              width: 120,
              height: 60,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#d1fae5",
              opacity: 1,
            },
            {
              id: `${baseId}-2`,
              type: "text",
              x: 330,
              y: 80,
              text: "Start",
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Process 1
            {
              id: `${baseId}-3`,
              type: "rectangle",
              x: 300,
              y: 150,
              width: 120,
              height: 60,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#e0f2fe",
              opacity: 1,
            },
            {
              id: `${baseId}-4`,
              type: "text",
              x: 315,
              y: 180,
              text: "Process 1",
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Decision
            {
              id: `${baseId}-5`,
              type: "rectangle",
              x: 300,
              y: 250,
              width: 120,
              height: 80,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#fef3c7",
              opacity: 1,
            },
            {
              id: `${baseId}-6`,
              type: "text",
              x: 315,
              y: 290,
              text: "Decision?",
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Process 2
            {
              id: `${baseId}-7`,
              type: "rectangle",
              x: 150,
              y: 350,
              width: 120,
              height: 60,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#e0f2fe",
              opacity: 1,
            },
            {
              id: `${baseId}-8`,
              type: "text",
              x: 165,
              y: 380,
              text: "Process 2",
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Process 3
            {
              id: `${baseId}-9`,
              type: "rectangle",
              x: 450,
              y: 350,
              width: 120,
              height: 60,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#e0f2fe",
              opacity: 1,
            },
            {
              id: `${baseId}-10`,
              type: "text",
              x: 465,
              y: 380,
              text: "Process 3",
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // End node
            {
              id: `${baseId}-11`,
              type: "ellipse",
              x: 300,
              y: 450,
              width: 120,
              height: 60,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#fee2e2",
              opacity: 1,
            },
            {
              id: `${baseId}-12`,
              type: "text",
              x: 335,
              y: 480,
              text: "End",
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Connector lines
            {
              id: `${baseId}-13`,
              type: "arrow",
              x: 360,
              y: 110,
              x2: 360,
              y2: 150,
              strokeWidth: 2,
              strokeColor: "#000000",
              opacity: 1,
            },
            {
              id: `${baseId}-14`,
              type: "arrow",
              x: 360,
              y: 210,
              x2: 360,
              y2: 250,
              strokeWidth: 2,
              strokeColor: "#000000",
              opacity: 1,
            },
            {
              id: `${baseId}-15`,
              type: "arrow",
              x: 300,
              y: 290,
              x2: 210,
              y2: 350,
              strokeWidth: 2,
              strokeColor: "#000000",
              opacity: 1,
            },
            {
              id: `${baseId}-16`,
              type: "arrow",
              x: 420,
              y: 290,
              x2: 510,
              y2: 350,
              strokeWidth: 2,
              strokeColor: "#000000",
              opacity: 1,
            },
            {
              id: `${baseId}-17`,
              type: "arrow",
              x: 210,
              y: 410,
              x2: 300,
              y2: 450,
              strokeWidth: 2,
              strokeColor: "#000000",
              opacity: 1,
            },
            {
              id: `${baseId}-18`,
              type: "arrow",
              x: 510,
              y: 410,
              x2: 420,
              y2: 450,
              strokeWidth: 2,
              strokeColor: "#000000",
              opacity: 1,
            },
            // Labels
            {
              id: `${baseId}-19`,
              type: "text",
              x: 270,
              y: 310,
              text: "Yes",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            {
              id: `${baseId}-20`,
              type: "text",
              x: 440,
              y: 310,
              text: "No",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
          ]
          break

        // Update the remaining templates similarly, marking text objects as isEditable: true
        case "Mind Map":
          templateObjects = [
            // Central topic
            {
              id: `${baseId}-1`,
              type: "ellipse",
              x: 350,
              y: 250,
              width: 120,
              height: 80,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#dbeafe",
              opacity: 1,
            },
            {
              id: `${baseId}-2`,
              type: "text",
              x: 370,
              y: 280,
              text: "Main Idea",
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Topic 1
            {
              id: `${baseId}-3`,
              type: "ellipse",
              x: 200,
              y: 150,
              width: 100,
              height: 60,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#e9d5ff",
              opacity: 1,
            },
            {
              id: `${baseId}-4`,
              type: "text",
              x: 220,
              y: 180,
              text: "Topic 1",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Topic 2
            {
              id: `${baseId}-5`,
              type: "ellipse",
              x: 500,
              y: 150,
              width: 100,
              height: 60,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#fce7f3",
              opacity: 1,
            },
            {
              id: `${baseId}-6`,
              type: "text",
              x: 520,
              y: 180,
              text: "Topic 2",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Topic 3
            {
              id: `${baseId}-7`,
              type: "ellipse",
              x: 200,
              y: 350,
              width: 100,
              height: 60,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#d1fae5",
              opacity: 1,
            },
            {
              id: `${baseId}-8`,
              type: "text",
              x: 220,
              y: 380,
              text: "Topic 3",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Topic 4
            {
              id: `${baseId}-9`,
              type: "ellipse",
              x: 500,
              y: 350,
              width: 100,
              height: 60,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#fee2e2",
              opacity: 1,
            },
            {
              id: `${baseId}-10`,
              type: "text",
              x: 520,
              y: 380,
              text: "Topic 4",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Subtopic 1.1
            {
              id: `${baseId}-11`,
              type: "ellipse",
              x: 100,
              y: 80,
              width: 80,
              height: 40,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#e9d5ff",
              opacity: 0.8,
            },
            {
              id: `${baseId}-12`,
              type: "text",
              x: 110,
              y: 100,
              text: "Subtopic 1.1",
              fontSize: 12,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Subtopic 2.1
            {
              id: `${baseId}-13`,
              type: "ellipse",
              x: 600,
              y: 80,
              width: 80,
              height: 40,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#fce7f3",
              opacity: 0.8,
            },
            {
              id: `${baseId}-14`,
              type: "text",
              x: 610,
              y: 100,
              text: "Subtopic 2.1",
              fontSize: 12,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Connector lines
            {
              id: `${baseId}-15`,
              type: "line",
              x: 350,
              y: 250,
              x2: 250,
              y2: 180,
              strokeWidth: 2,
              strokeColor: "#000000",
              opacity: 1,
            },
            {
              id: `${baseId}-16`,
              type: "line",
              x: 470,
              y: 250,
              x2: 550,
              y2: 180,
              strokeWidth: 2,
              strokeColor: "#000000",
              opacity: 1,
            },
            {
              id: `${baseId}-17`,
              type: "line",
              x: 350,
              y: 330,
              x2: 250,
              y2: 380,
              strokeWidth: 2,
              strokeColor: "#000000",
              opacity: 1,
            },
            {
              id: `${baseId}-18`,
              type: "line",
              x: 470,
              y: 330,
              x2: 550,
              y2: 380,
              strokeWidth: 2,
              strokeColor: "#000000",
              opacity: 1,
            },
            {
              id: `${baseId}-19`,
              type: "line",
              x: 200,
              y: 150,
              x2: 140,
              y2: 100,
              strokeWidth: 1,
              strokeColor: "#000000",
              opacity: 1,
            },
            {
              id: `${baseId}-20`,
              type: "line",
              x: 600,
              y: 150,
              x2: 640,
              y2: 100,
              strokeWidth: 1,
              strokeColor: "#000000",
              opacity: 1,
            },
          ]
          break

        case "ER Diagram":
          templateObjects = [
            // Entity 1
            {
              id: `${baseId}-1`,
              type: "rectangle",
              x: 150,
              y: 150,
              width: 120,
              height: 60,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#dbeafe",
              opacity: 1,
            },
            {
              id: `${baseId}-2`,
              type: "text",
              x: 180,
              y: 180,
              text: "Entity 1",
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Entity 2
            {
              id: `${baseId}-3`,
              type: "rectangle",
              x: 550,
              y: 150,
              width: 120,
              height: 60,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#dbeafe",
              opacity: 1,
            },
            {
              id: `${baseId}-4`,
              type: "text",
              x: 580,
              y: 180,
              text: "Entity 2",
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Entity 3
            {
              id: `${baseId}-5`,
              type: "rectangle",
              x: 350,
              y: 350,
              width: 120,
              height: 60,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#dbeafe",
              opacity: 1,
            },
            {
              id: `${baseId}-6`,
              type: "text",
              x: 380,
              y: 380,
              text: "Entity 3",
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Relationship 1
            {
              id: `${baseId}-7`,
              type: "rectangle",
              x: 350,
              y: 150,
              width: 120,
              height: 60,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#fee2e2",
              opacity: 1,
            },
            {
              id: `${baseId}-8`,
              type: "text",
              x: 365,
              y: 180,
              text: "Relationship",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Relationship 2
            {
              id: `${baseId}-9`,
              type: "rectangle",
              x: 250,
              y: 250,
              width: 120,
              height: 60,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#fee2e2",
              opacity: 1,
            },
            {
              id: `${baseId}-10`,
              type: "text",
              x: 265,
              y: 280,
              text: "Relationship",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Relationship 3
            {
              id: `${baseId}-11`,
              type: "rectangle",
              x: 450,
              y: 250,
              width: 120,
              height: 60,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#fee2e2",
              opacity: 1,
            },
            {
              id: `${baseId}-12`,
              type: "text",
              x: 465,
              y: 280,
              text: "Relationship",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Connector lines
            {
              id: `${baseId}-13`,
              type: "line",
              x: 270,
              y: 180,
              x2: 350,
              y2: 180,
              strokeWidth: 2,
              strokeColor: "#000000",
              opacity: 1,
            },
            {
              id: `${baseId}-14`,
              type: "line",
              x: 470,
              y: 180,
              x2: 550,
              y2: 180,
              strokeWidth: 2,
              strokeColor: "#000000",
              opacity: 1,
            },
            {
              id: `${baseId}-15`,
              type: "line",
              x: 210,
              y: 210,
              x2: 250,
              y2: 250,
              strokeWidth: 2,
              strokeColor: "#000000",
              opacity: 1,
            },
            {
              id: `${baseId}-16`,
              type: "line",
              x: 370,
              y: 310,
              x2: 410,
              y2: 350,
              strokeWidth: 2,
              strokeColor: "#000000",
              opacity: 1,
            },
            {
              id: `${baseId}-17`,
              type: "line",
              x: 610,
              y: 210,
              x2: 570,
              y2: 250,
              strokeWidth: 2,
              strokeColor: "#000000",
              opacity: 1,
            },
            {
              id: `${baseId}-18`,
              type: "line",
              x: 450,
              y: 310,
              x2: 410,
              y2: 350,
              strokeWidth: 2,
              strokeColor: "#000000",
              opacity: 1,
            },
            // Cardinality
            {
              id: `${baseId}-19`,
              type: "text",
              x: 280,
              y: 160,
              text: "1",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            {
              id: `${baseId}-20`,
              type: "text",
              x: 530,
              y: 160,
              text: "N",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
          ]
          break

        case "Wireframe":
          templateObjects = [
            // Header
            {
              id: `${baseId}-1`,
              type: "rectangle",
              x: 100,
              y: 50,
              width: 600,
              height: 60,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#f3f4f6",
              opacity: 1,
            },
            {
              id: `${baseId}-2`,
              type: "text",
              x: 120,
              y: 85,
              text: "Logo",
              fontSize: 18,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            {
              id: `${baseId}-3`,
              type: "rectangle",
              x: 500,
              y: 65,
              width: 180,
              height: 30,
              strokeWidth: 1,
              strokeColor: "#000000",
              fillColor: "#ffffff",
              opacity: 1,
            },
            {
              id: `${baseId}-4`,
              type: "text",
              x: 520,
              y: 85,
              text: "Search...",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#9ca3af",
              opacity: 1,
              isEditable: true,
            },
            // Navigation
            {
              id: `${baseId}-5`,
              type: "rectangle",
              x: 100,
              y: 110,
              width: 600,
              height: 40,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#e5e7eb",
              opacity: 1,
            },
            {
              id: `${baseId}-6`,
              type: "text",
              x: 150,
              y: 135,
              text: "Home",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            {
              id: `${baseId}-7`,
              type: "text",
              x: 250,
              y: 135,
              text: "Products",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            {
              id: `${baseId}-8`,
              type: "text",
              x: 350,
              y: 135,
              text: "Services",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            {
              id: `${baseId}-9`,
              type: "text",
              x: 450,
              y: 135,
              text: "About",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            {
              id: `${baseId}-10`,
              type: "text",
              x: 550,
              y: 135,
              text: "Contact",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Hero section
            {
              id: `${baseId}-11`,
              type: "rectangle",
              x: 100,
              y: 150,
              width: 600,
              height: 200,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#f9fafb",
              opacity: 1,
            },
            {
              id: `${baseId}-12`,
              type: "text",
              x: 350,
              y: 220,
              text: "Hero Image",
              fontSize: 24,
              fontFamily: "sans-serif",
              strokeColor: "#9ca3af",
              opacity: 1,
              isEditable: true,
            },
            {
              id: `${baseId}-13`,
              type: "text",
              x: 330,
              y: 260,
              text: "Call to Action",
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Content section
            {
              id: `${baseId}-14`,
              type: "rectangle",
              x: 100,
              y: 350,
              width: 380,
              height: 200,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#ffffff",
              opacity: 1,
            },
            {
              id: `${baseId}-15`,
              type: "text",
              x: 120,
              y: 380,
              text: "Main Content",
              fontSize: 18,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            {
              id: `${baseId}-16`,
              type: "rectangle",
              x: 480,
              y: 350,
              width: 220,
              height: 200,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#f3f4f6",
              opacity: 1,
            },
            {
              id: `${baseId}-17`,
              type: "text",
              x: 550,
              y: 380,
              text: "Sidebar",
              fontSize: 18,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Footer
            {
              id: `${baseId}-18`,
              type: "rectangle",
              x: 100,
              y: 550,
              width: 600,
              height: 80,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#e5e7eb",
              opacity: 1,
            },
            {
              id: `${baseId}-19`,
              type: "text",
              x: 350,
              y: 590,
              text: "Footer Content",
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
          ]
          break

        case "Kanban Board":
          templateObjects = [
            // Board header
            {
              id: `${baseId}-1`,
              type: "rectangle",
              x: 50,
              y: 50,
              width: 700,
              height: 50,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#f3f4f6",
              opacity: 1,
            },
            {
              id: `${baseId}-2`,
              type: "text",
              x: 375,
              y: 80,
              text: "Project Kanban Board",
              fontSize: 18,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // To Do column
            {
              id: `${baseId}-3`,
              type: "rectangle",
              x: 50,
              y: 100,
              width: 200,
              height: 400,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#dbeafe",
              opacity: 1,
            },
            {
              id: `${baseId}-4`,
              type: "text",
              x: 130,
              y: 125,
              text: "To Do",
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // In Progress column
            {
              id: `${baseId}-5`,
              type: "rectangle",
              x: 300,
              y: 100,
              width: 200,
              height: 400,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#e0f2fe",
              opacity: 1,
            },
            {
              id: `${baseId}-6`,
              type: "text",
              x: 360,
              y: 125,
              text: "In Progress",
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // Done column
            {
              id: `${baseId}-7`,
              type: "rectangle",
              x: 550,
              y: 100,
              width: 200,
              height: 400,
              strokeWidth: 2,
              strokeColor: "#000000",
              fillColor: "#d1fae5",
              opacity: 1,
            },
            {
              id: `${baseId}-8`,
              type: "text",
              x: 630,
              y: 125,
              text: "Done",
              fontSize: 16,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            // To Do cards
            {
              id: `${baseId}-9`,
              type: "rectangle",
              x: 70,
              y: 150,
              width: 160,
              height: 80,
              strokeWidth: 1,
              strokeColor: "#000000",
              fillColor: "#ffffff",
              opacity: 1,
            },
            {
              id: `${baseId}-10`,
              type: "text",
              x: 90,
              y: 175,
              text: "Task 1",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            {
              id: `${baseId}-11`,
              type: "text",
              x: 90,
              y: 195,
              text: "Design homepage",
              fontSize: 12,
              fontFamily: "sans-serif",
              strokeColor: "#6b7280",
              opacity: 1,
              isEditable: true,
            },
            {
              id: `${baseId}-12`,
              type: "rectangle",
              x: 70,
              y: 250,
              width: 160,
              height: 80,
              strokeWidth: 1,
              strokeColor: "#000000",
              fillColor: "#ffffff",
              opacity: 1,
            },
            {
              id: `${baseId}-13`,
              type: "text",
              x: 90,
              y: 275,
              text: "Task 2",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            {
              id: `${baseId}-14`,
              type: "text",
              x: 90,
              y: 295,
              text: "Create user flow",
              fontSize: 12,
              fontFamily: "sans-serif",
              strokeColor: "#6b7280",
              opacity: 1,
              isEditable: true,
            },
            // In Progress cards
            {
              id: `${baseId}-15`,
              type: "rectangle",
              x: 320,
              y: 150,
              width: 160,
              height: 80,
              strokeWidth: 1,
              strokeColor: "#000000",
              fillColor: "#ffffff",
              opacity: 1,
            },
            {
              id: `${baseId}-16`,
              type: "text",
              x: 340,
              y: 175,
              text: "Task 3",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            {
              id: `${baseId}-17`,
              type: "text",
              x: 340,
              y: 195,
              text: "Implement API",
              fontSize: 12,
              fontFamily: "sans-serif",
              strokeColor: "#6b7280",
              opacity: 1,
              isEditable: true,
            },
            // Done cards
            {
              id: `${baseId}-18`,
              type: "rectangle",
              x: 570,
              y: 150,
              width: 160,
              height: 80,
              strokeWidth: 1,
              strokeColor: "#000000",
              fillColor: "#ffffff",
              opacity: 1,
            },
            {
              id: `${baseId}-19`,
              type: "text",
              x: 590,
              y: 175,
              text: "Task 4",
              fontSize: 14,
              fontFamily: "sans-serif",
              strokeColor: "#000000",
              opacity: 1,
              isEditable: true,
            },
            {
              id: `${baseId}-20`,
              type: "text",
              x: 590,
              y: 195,
              text: "Project setup",
              fontSize: 12,
              fontFamily: "sans-serif",
              strokeColor: "#6b7280",
              opacity: 1,
              isEditable: true,
            },
          ]
          break

        default:
          toast({
            title: "Template not found",
            description: "The selected template could not be applied.",
            variant: "destructive",
          })
          return
      }

      // Add the template objects to the canvas
      addObjects(templateObjects)

      toast({
        title: "Template Applied",
        description: `${templateName} template has been applied to your canvas. Double-click on text to edit.`,
      })
    },
    [addObjects, toast],
  )

  return (
    <WhiteboardContext.Provider
      value={{
        activeTool,
        setActiveTool,
        strokeWidth,
        setStrokeWidth,
        strokeColor,
        setStrokeColor,
        fillColor,
        setFillColor,
        opacity,
        setOpacity,
        zoom,
        zoomIn,
        zoomOut,
        selectedObject,
        setSelectedObject,
        objects,
        setObjects,
        addObject,
        addObjects,
        updateSelectedObject,
        deleteSelectedObject,
        duplicateSelectedObject,
        clearSelection,
        clearCanvas,
        history,
        historyIndex,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        exportCanvas,
        saveCanvas,
        showGrid,
        toggleGrid,
        snapToGrid,
        toggleSnapToGrid,
        gridSize,
        bringToFront,
        sendToBack,
        bringForward,
        sendBackward,
        applyTemplate,
      }}
    >
      {children}
    </WhiteboardContext.Provider>
  )
}

export function useWhiteboard() {
  const context = useContext(WhiteboardContext)
  if (context === undefined) {
    throw new Error("useWhiteboard must be used within a WhiteboardProvider")
  }
  return context
}
