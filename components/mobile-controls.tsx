"use client"

import { Button } from "@/components/ui/button"
import { useWhiteboard } from "@/context/whiteboard-context"
import {
  ChevronLeft,
  Eraser,
  Hand,
  LineChartIcon as LineIcon,
  Pencil,
  Square,
  Circle,
  ZoomIn,
  ZoomOut,
  Triangle,
  Type,
  PenTool,
  ImageIcon,
  Sticker,
  Palette,
  Settings,
  Save,
  Download,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

export function MobileControls() {
  const {
    activeTool,
    setActiveTool,
    zoomIn,
    zoomOut,
    undo,
    redo,
    canUndo,
    canRedo,
    strokeWidth,
    setStrokeWidth,
    strokeColor,
    setStrokeColor,
    fillColor,
    setFillColor,
    opacity,
    setOpacity,
    showGrid,
    toggleGrid,
    snapToGrid,
    toggleSnapToGrid,
    clearCanvas,
    exportCanvas,
    saveCanvas,
  } = useWhiteboard()

  const [activeTab, setActiveTab] = useState("tools")

  return (
    <>
      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-background/90 backdrop-blur-sm p-2 rounded-full border shadow-md">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[80vw] sm:max-w-md">
            <div className="h-full overflow-y-auto">
              <div className="p-4 font-medium chitran-gradient dark:chitran-gradient-dark text-white">
                Chitran: Tools & Shapes
              </div>

              <Tabs defaultValue="tools" className="p-4">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="tools">Tools</TabsTrigger>
                  <TabsTrigger value="shapes">Shapes</TabsTrigger>
                  <TabsTrigger value="insert">Insert</TabsTrigger>
                </TabsList>

                <TabsContent value="tools" className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={activeTool === "select" ? "default" : "outline"}
                      className="h-16 flex flex-col items-center justify-center gap-1"
                      onClick={() => setActiveTool("select")}
                    >
                      <Hand className="h-5 w-5" />
                      <span className="text-xs">Select</span>
                    </Button>
                    <Button
                      variant={activeTool === "pen" ? "default" : "outline"}
                      className="h-16 flex flex-col items-center justify-center gap-1"
                      onClick={() => setActiveTool("pen")}
                    >
                      <Pencil className="h-5 w-5" />
                      <span className="text-xs">Pen</span>
                    </Button>
                    <Button
                      variant={activeTool === "brush" ? "default" : "outline"}
                      className="h-16 flex flex-col items-center justify-center gap-1"
                      onClick={() => setActiveTool("brush")}
                    >
                      <PenTool className="h-5 w-5" />
                      <span className="text-xs">Brush</span>
                    </Button>
                    <Button
                      variant={activeTool === "eraser" ? "default" : "outline"}
                      className="h-16 flex flex-col items-center justify-center gap-1"
                      onClick={() => setActiveTool("eraser")}
                    >
                      <Eraser className="h-5 w-5" />
                      <span className="text-xs">Eraser</span>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="shapes" className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={activeTool === "line" ? "default" : "outline"}
                      className="h-16 flex flex-col items-center justify-center gap-1"
                      onClick={() => setActiveTool("line")}
                    >
                      <LineIcon className="h-5 w-5" />
                      <span className="text-xs">Line</span>
                    </Button>
                    <Button
                      variant={activeTool === "rectangle" ? "default" : "outline"}
                      className="h-16 flex flex-col items-center justify-center gap-1"
                      onClick={() => setActiveTool("rectangle")}
                    >
                      <Square className="h-5 w-5" />
                      <span className="text-xs">Rectangle</span>
                    </Button>
                    <Button
                      variant={activeTool === "circle" ? "default" : "outline"}
                      className="h-16 flex flex-col items-center justify-center gap-1"
                      onClick={() => setActiveTool("circle")}
                    >
                      <Circle className="h-5 w-5" />
                      <span className="text-xs">Circle</span>
                    </Button>
                    <Button
                      variant={activeTool === "triangle" ? "default" : "outline"}
                      className="h-16 flex flex-col items-center justify-center gap-1"
                      onClick={() => setActiveTool("triangle")}
                    >
                      <Triangle className="h-5 w-5" />
                      <span className="text-xs">Triangle</span>
                    </Button>
                    <Button
                      variant={activeTool === "text" ? "default" : "outline"}
                      className="h-16 flex flex-col items-center justify-center gap-1"
                      onClick={() => setActiveTool("text")}
                    >
                      <Type className="h-5 w-5" />
                      <span className="text-xs">Text</span>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="insert" className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={activeTool === "image" ? "default" : "outline"}
                      className="h-16 flex flex-col items-center justify-center gap-1"
                      onClick={() => setActiveTool("image")}
                    >
                      <ImageIcon className="h-5 w-5" />
                      <span className="text-xs">Image</span>
                    </Button>
                    <Button
                      variant={activeTool === "sticker" ? "default" : "outline"}
                      className="h-16 flex flex-col items-center justify-center gap-1"
                      onClick={() => setActiveTool("sticker")}
                    >
                      <Sticker className="h-5 w-5" />
                      <span className="text-xs">Sticker</span>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="p-4 border-t">
                <h3 className="font-medium mb-4">Style & Settings</h3>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Stroke Width</Label>
                      <span className="text-sm">{strokeWidth}px</span>
                    </div>
                    <Slider
                      value={[strokeWidth]}
                      min={1}
                      max={20}
                      step={1}
                      onValueChange={(value) => setStrokeWidth(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Stroke Color</Label>
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
                      ].map((color) => (
                        <Button
                          key={color}
                          variant="outline"
                          className="w-10 h-10 p-0 rounded-md"
                          style={{ backgroundColor: color }}
                          onClick={() => setStrokeColor(color)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Fill Color</Label>
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
                      ].map((color) => (
                        <Button
                          key={color}
                          variant="outline"
                          className={`w-10 h-10 p-0 rounded-md ${
                            color === "transparent" ? "bg-transparent border-dashed" : ""
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFillColor(color)}
                        />
                      ))}
                    </div>
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

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mobile-show-grid">Show Grid</Label>
                      <Switch id="mobile-show-grid" checked={showGrid} onCheckedChange={toggleGrid} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mobile-snap-grid">Snap to Grid</Label>
                      <Switch id="mobile-snap-grid" checked={snapToGrid} onCheckedChange={toggleSnapToGrid} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" onClick={saveCanvas} className="flex flex-col items-center gap-1 h-16">
                      <Save className="h-5 w-5" />
                      <span className="text-xs">Save</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => exportCanvas("png")}
                      className="flex flex-col items-center gap-1 h-16"
                    >
                      <Download className="h-5 w-5" />
                      <span className="text-xs">Export</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearCanvas}
                      className="flex flex-col items-center gap-1 h-16 text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="text-xs">Clear</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <motion.div
          className="flex items-center gap-1"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant={activeTool === "select" ? "default" : "ghost"}
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={() => setActiveTool("select")}
          >
            <Hand className="h-5 w-5" />
          </Button>

          <Button
            variant={activeTool === "pen" ? "default" : "ghost"}
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={() => setActiveTool("pen")}
          >
            <Pencil className="h-5 w-5" />
          </Button>

          <Button
            variant={activeTool === "eraser" ? "default" : "ghost"}
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={() => setActiveTool("eraser")}
          >
            <Eraser className="h-5 w-5" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <Palette className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" side="top">
              <div className="grid grid-cols-6 gap-2">
                {["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"].map(
                  (color) => (
                    <Button
                      key={color}
                      variant="outline"
                      className="w-8 h-8 p-0 rounded-md"
                      style={{ backgroundColor: color }}
                      onClick={() => setStrokeColor(color)}
                    />
                  ),
                )}
              </div>
              <div className="mt-2">
                <Slider
                  value={[strokeWidth]}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={(value) => setStrokeWidth(value[0])}
                />
              </div>
            </PopoverContent>
          </Popover>
        </motion.div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={zoomIn}>
            <ZoomIn className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={zoomOut}>
            <ZoomOut className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={undo} disabled={!canUndo}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 14 4 9l5-5" />
              <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
            </svg>
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={redo} disabled={!canRedo}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 14 5-5-5-5" />
              <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H14" />
            </svg>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
              <Settings className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-[80vw] sm:max-w-md">
            <div className="h-full overflow-y-auto">
              <div className="p-4 font-medium chitran-gradient dark:chitran-gradient-dark text-white">
                Properties & Settings
              </div>
              {/* Mobile properties panel content */}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
