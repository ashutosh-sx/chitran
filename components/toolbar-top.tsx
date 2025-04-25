"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTheme } from "next-themes"
import { useWhiteboard } from "@/context/whiteboard-context"
import {
  RedoIcon as ArrowRedo,
  UndoIcon as ArrowUndo,
  Circle,
  Download,
  Eraser,
  Hand,
  Layers,
  LineChartIcon as LineIcon,
  Moon,
  Pencil,
  Save,
  Share2,
  Square,
  SunMedium,
  Type,
  ZoomIn,
  ZoomOut,
  Trash2,
  FileDown,
  PanelLeft,
  PanelRight,
  Triangle,
  Hexagon,
  Star,
  CircleEllipsisIcon as Ellipse,
  PenTool,
  ArrowRight,
  ArrowLeftRight,
  ImageIcon,
  Sticker,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

interface ToolbarTopProps {
  onToggleLeftPanel: () => void
  onToggleRightPanel: () => void
}

export function ToolbarTop({ onToggleLeftPanel, onToggleRightPanel }: ToolbarTopProps) {
  const { setTheme, theme } = useTheme()
  const { toast } = useToast()
  const {
    activeTool,
    setActiveTool,
    strokeWidth,
    setStrokeWidth,
    strokeColor,
    setStrokeColor,
    fillColor,
    setFillColor,
    undo,
    redo,
    canUndo,
    canRedo,
    zoomIn,
    zoomOut,
    exportCanvas,
    saveCanvas,
    toggleGrid,
    showGrid,
    toggleSnapToGrid,
    snapToGrid,
    zoom,
    clearCanvas,
    applyTemplate,
    opacity,
    setOpacity,
  } = useWhiteboard()

  const handleShare = () => {
    toast({
      title: "Share link copied!",
      description: "Collaboration link has been copied to clipboard.",
    })
  }

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap items-center p-2 border-b border-border bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-md"
      >
        <Button variant="ghost" size="icon" onClick={onToggleLeftPanel} className="hover:bg-muted">
          <PanelLeft className="h-5 w-5" />
        </Button>

        <Separator orientation="vertical" className="mx-2 h-6 hidden sm:block" />

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="mr-2 font-semibold chitran-gradient dark:chitran-gradient-dark border-0">
            Chitran
          </Badge>
          <span className="text-sm text-muted-foreground hidden md:inline-block">Craft. Color. Collaborate.</span>

          <ToggleGroup
            type="single"
            value={activeTool}
            onValueChange={(value) => value && setActiveTool(value)}
            className="hidden sm:flex"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="select" aria-label="Select tool" className="h-9 w-9 p-0">
                  <Hand className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Select (V)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="pen" aria-label="Pen tool" className="h-9 w-9 p-0">
                  <Pencil className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Pen (P)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="brush" aria-label="Brush tool" className="h-9 w-9 p-0">
                  <PenTool className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Brush</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="eraser" aria-label="Eraser tool" className="h-9 w-9 p-0">
                  <Eraser className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Eraser (E)</TooltipContent>
            </Tooltip>
          </ToggleGroup>
        </div>

        <Separator orientation="vertical" className="mx-2 h-6 hidden sm:block" />

        <div className="flex items-center gap-1 hidden sm:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 flex items-center gap-1">
                <Square className="h-4 w-4" />
                <span>Shapes</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setActiveTool("line")}>
                <LineIcon className="h-4 w-4 mr-2" />
                Line
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTool("arrow")}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Arrow
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTool("doubleArrow")}>
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Double Arrow
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTool("rectangle")}>
                <Square className="h-4 w-4 mr-2" />
                Rectangle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTool("circle")}>
                <Circle className="h-4 w-4 mr-2" />
                Circle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTool("ellipse")}>
                <Ellipse className="h-4 w-4 mr-2" />
                Ellipse
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTool("triangle")}>
                <Triangle className="h-4 w-4 mr-2" />
                Triangle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTool("hexagon")}>
                <Hexagon className="h-4 w-4 mr-2" />
                Hexagon
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTool("star")}>
                <Star className="h-4 w-4 mr-2" />
                Star
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTool("text")}>
                <Type className="h-4 w-4 mr-2" />
                Text
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                <span>Insert</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setActiveTool("image")}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTool("sticker")}>
                <Sticker className="h-4 w-4 mr-2" />
                Sticker
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 flex items-center gap-1">
                <FileDown className="h-4 w-4" />
                <span>Templates</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                Double-click on text to edit template content
              </div>
              <DropdownMenuItem onClick={() => applyTemplate("UML Diagram")}>UML Diagram</DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTemplate("Flowchart")}>Flowchart</DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTemplate("Mind Map")}>Mind Map</DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTemplate("ER Diagram")}>ER Diagram</DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTemplate("Wireframe")}>Wireframe</DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTemplate("Kanban Board")}>Kanban Board</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator orientation="vertical" className="mx-2 h-6 hidden sm:block" />

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} className="h-9 w-9 p-0">
                <ArrowUndo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} className="h-9 w-9 p-0">
                <ArrowRedo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="mx-2 h-6 hidden sm:block" />

        <div className="flex items-center gap-1 hidden sm:flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={zoomOut} className="h-9 w-9 p-0">
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out (Ctrl+-)</TooltipContent>
          </Tooltip>

          <Badge variant="outline" className="mx-1">
            {Math.round(zoom * 100)}%
          </Badge>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={zoomIn} className="h-9 w-9 p-0">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In (Ctrl++)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="mx-2 h-6 hidden sm:block" />

        <div className="flex items-center gap-2 hidden sm:flex">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-8 h-8 p-0 rounded-md" style={{ backgroundColor: strokeColor }}>
                <span className="sr-only">Pick a color</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Stroke Color</h4>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    "#000000",
                    "#ffffff",
                    "#ff0000",
                    "#00ff00",
                    "#0000ff",
                    "#ffff00",
                    "#00ffff",
                    "#ff00ff",
                    "#c0c0c0",
                    "#808080",
                    "#800000",
                    "#808000",
                    "#008000",
                    "#800080",
                    "#008080",
                    "#000080",
                    "#ff9900",
                    "#9966ff",
                  ].map((color) => (
                    <Button
                      key={color}
                      variant="outline"
                      className="w-8 h-8 p-0 rounded-md"
                      style={{ backgroundColor: color }}
                      onClick={() => setStrokeColor(color)}
                    />
                  ))}
                </div>
                <h4 className="font-medium text-sm pt-2">Fill Color</h4>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    "transparent",
                    "#ffffff",
                    "#ff0000",
                    "#00ff00",
                    "#0000ff",
                    "#ffff00",
                    "#00ffff",
                    "#ff00ff",
                    "#c0c0c0",
                    "#808080",
                    "#800000",
                    "#808000",
                    "#008000",
                    "#800080",
                    "#008080",
                    "#000080",
                    "#ff9900",
                    "#9966ff",
                  ].map((color) => (
                    <Button
                      key={color}
                      variant="outline"
                      className={`w-8 h-8 p-0 rounded-md ${
                        color === "transparent" ? "bg-transparent border-dashed" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFillColor(color)}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="w-32 hidden md:block">
            <Slider
              value={[strokeWidth]}
              min={1}
              max={20}
              step={1}
              onValueChange={(value) => setStrokeWidth(value[0])}
            />
          </div>
        </div>

        <Separator orientation="vertical" className="mx-2 h-6 hidden sm:block" />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 p-0 hidden sm:flex">
              <Layers className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Canvas Settings</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-grid">Show Grid</Label>
                  <Switch id="show-grid" checked={showGrid} onCheckedChange={toggleGrid} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="snap-grid">Snap to Grid</Label>
                  <Switch id="snap-grid" checked={snapToGrid} onCheckedChange={toggleSnapToGrid} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Opacity</Label>
                    <span className="text-sm">{Math.round(opacity * 100)}%</span>
                  </div>
                  <Slider
                    value={[opacity * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setOpacity(value[0] / 100)}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="ml-auto flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleShare} className="h-9 w-9 p-0 hidden sm:flex">
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newTheme = theme === "dark" ? "light" : "dark"
                  setTheme(newTheme)
                }}
                className="h-9 w-9 p-0"
              >
                {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Theme</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => exportCanvas("png")}
                className="h-9 w-9 p-0 hidden sm:flex"
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export (Ctrl+E)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={saveCanvas} className="h-9 w-9 p-0 hidden sm:flex">
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save (Ctrl+S)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearCanvas}
                className="h-9 w-9 p-0 text-red-500 hidden sm:flex"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear Canvas</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="mx-2 h-6 hidden sm:block" />

        <Button variant="ghost" size="icon" onClick={onToggleRightPanel} className="hover:bg-muted">
          <PanelRight className="h-5 w-5" />
        </Button>
      </motion.div>
    </TooltipProvider>
  )
}
