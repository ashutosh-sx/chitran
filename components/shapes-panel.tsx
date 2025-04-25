"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useWhiteboard } from "@/context/whiteboard-context"
import {
  Circle,
  Eraser,
  Hand,
  LineChartIcon as LineIcon,
  Pencil,
  Square,
  Type,
  Triangle,
  Hexagon,
  Star,
  CircleEllipsisIcon as Ellipse,
  PenTool,
  Highlighter,
  ArrowRight,
  ArrowLeftRight,
  ImageIcon,
  Sticker,
  LayoutTemplate,
} from "lucide-react"
import { motion } from "framer-motion"

interface ShapesPanelProps {
  className?: string
}

export function ShapesPanel({ className }: ShapesPanelProps) {
  const { setActiveTool, activeTool, applyTemplate } = useWhiteboard()

  const tools = [
    { name: "Select", icon: <Hand className="h-6 w-6" />, tool: "select" },
    { name: "Pen", icon: <Pencil className="h-6 w-6" />, tool: "pen" },
    { name: "Brush", icon: <PenTool className="h-6 w-6" />, tool: "brush" },
    { name: "Highlighter", icon: <Highlighter className="h-6 w-6" />, tool: "highlighter" },
    { name: "Eraser", icon: <Eraser className="h-6 w-6" />, tool: "eraser" },
  ]

  const shapes = [
    { name: "Line", icon: <LineIcon className="h-6 w-6" />, tool: "line" },
    { name: "Arrow", icon: <ArrowRight className="h-6 w-6" />, tool: "arrow" },
    { name: "Double Arrow", icon: <ArrowLeftRight className="h-6 w-6" />, tool: "doubleArrow" },
    { name: "Rectangle", icon: <Square className="h-6 w-6" />, tool: "rectangle" },
    { name: "Circle", icon: <Circle className="h-6 w-6" />, tool: "circle" },
    { name: "Ellipse", icon: <Ellipse className="h-6 w-6" />, tool: "ellipse" },
    { name: "Triangle", icon: <Triangle className="h-6 w-6" />, tool: "triangle" },
    { name: "Hexagon", icon: <Hexagon className="h-6 w-6" />, tool: "hexagon" },
    { name: "Star", icon: <Star className="h-6 w-6" />, tool: "star" },
    { name: "Text", icon: <Type className="h-6 w-6" />, tool: "text" },
  ]

  const insertables = [
    { name: "Image", icon: <ImageIcon className="h-6 w-6" />, tool: "image" },
    { name: "Sticker", icon: <Sticker className="h-6 w-6" />, tool: "sticker" },
  ]

  const templates = [
    { name: "UML Diagram", icon: <LayoutTemplate className="h-6 w-6" />, template: "UML Diagram" },
    { name: "Flowchart", icon: <LayoutTemplate className="h-6 w-6" />, template: "Flowchart" },
    { name: "Mind Map", icon: <LayoutTemplate className="h-6 w-6" />, template: "Mind Map" },
    { name: "ER Diagram", icon: <LayoutTemplate className="h-6 w-6" />, template: "ER Diagram" },
    { name: "Wireframe", icon: <LayoutTemplate className="h-6 w-6" />, template: "Wireframe" },
    { name: "Kanban Board", icon: <LayoutTemplate className="h-6 w-6" />, template: "Kanban Board" },
  ]

  return (
    <div className={className}>
      <div className="p-4 font-medium chitran-gradient dark:chitran-gradient-dark">Tools & Shapes</div>
      <Separator />
      <ScrollArea className="h-full">
        <div className="p-4">
          <h3 className="text-sm font-medium mb-2">Drawing Tools</h3>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {tools.map((tool) => (
              <motion.div key={tool.name} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant={activeTool === tool.tool ? "default" : "outline"}
                  className="h-20 w-full flex flex-col items-center justify-center gap-2"
                  onClick={() => setActiveTool(tool.tool)}
                >
                  {tool.icon}
                  <span className="text-xs">{tool.name}</span>
                </Button>
              </motion.div>
            ))}
          </div>

          <h3 className="text-sm font-medium mb-2">Shapes</h3>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {shapes.map((shape) => (
              <motion.div key={shape.name} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant={activeTool === shape.tool ? "default" : "outline"}
                  className="h-20 w-full flex flex-col items-center justify-center gap-2"
                  onClick={() => setActiveTool(shape.tool)}
                >
                  {shape.icon}
                  <span className="text-xs">{shape.name}</span>
                </Button>
              </motion.div>
            ))}
          </div>

          <h3 className="text-sm font-medium mb-2">Insert</h3>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {insertables.map((item) => (
              <motion.div key={item.name} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant={activeTool === item.tool ? "default" : "outline"}
                  className="h-20 w-full flex flex-col items-center justify-center gap-2"
                  onClick={() => setActiveTool(item.tool)}
                >
                  {item.icon}
                  <span className="text-xs">{item.name}</span>
                </Button>
              </motion.div>
            ))}
          </div>

          <h3 className="text-sm font-medium mb-2">Templates</h3>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((template) => (
              <motion.div key={template.name} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col items-center justify-center gap-2"
                  onClick={() => applyTemplate(template.template)}
                >
                  {template.icon}
                  <span className="text-xs">{template.name}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
