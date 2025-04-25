"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { useWhiteboard } from "@/context/whiteboard-context"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Copy,
  Italic,
  Layers,
  Trash,
  Underline,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface PropertiesPanelProps {
  className?: string
}

export function PropertiesPanel({ className }: PropertiesPanelProps) {
  const {
    selectedObject,
    strokeWidth,
    setStrokeWidth,
    strokeColor,
    setStrokeColor,
    fillColor,
    setFillColor,
    opacity,
    setOpacity,
    deleteSelectedObject,
    duplicateSelectedObject,
    updateSelectedObject,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    objects,
  } = useWhiteboard()

  const { toast } = useToast()
  const [isStyleOpen, setIsStyleOpen] = useState(true)
  const [isPositionOpen, setIsPositionOpen] = useState(true)
  const [isLayersOpen, setIsLayersOpen] = useState(true)
  const [isTextOpen, setIsTextOpen] = useState(true)

  const handleDeleteObject = () => {
    if (selectedObject) {
      deleteSelectedObject()
      toast({
        title: "Object deleted",
        description: "The selected object has been deleted.",
      })
    }
  }

  const handleDuplicateObject = () => {
    if (selectedObject) {
      duplicateSelectedObject()
      toast({
        title: "Object duplicated",
        description: "The selected object has been duplicated.",
      })
    }
  }

  const handlePositionChange = (property: string, value: number | string) => {
    if (selectedObject) {
      updateSelectedObject({
        ...selectedObject,
        [property]: value,
      })
    }
  }

  const handleTextStyleChange = (property: string, value: any) => {
    if (selectedObject && selectedObject.type === "text") {
      updateSelectedObject({
        ...selectedObject,
        [property]: value,
      })
    }
  }

  // Ensure numeric values have defaults to prevent NaN
  const getNumericValue = (value: any, defaultValue = 0) => {
    return typeof value === "number" && !isNaN(value) ? value : defaultValue
  }

  return (
    <div className={className}>
      <div className="p-4 font-medium flex justify-between items-center chitran-gradient dark:chitran-gradient-dark">
        <span>Properties</span>
        {selectedObject && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDuplicateObject}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteObject}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <Separator />
      <ScrollArea className="h-full">
        <div className="p-4">
          {selectedObject ? (
            <div className="space-y-4">
              <Collapsible open={isStyleOpen} onOpenChange={setIsStyleOpen} className="space-y-2">
                <CollapsibleTrigger className="flex w-full items-center justify-between py-1">
                  <h3 className="text-sm font-medium">Style</h3>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isStyleOpen ? "rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-1">
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
                          className="w-8 h-8 p-0 rounded-md"
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            setStrokeColor(color)
                            if (selectedObject) {
                              updateSelectedObject({
                                ...selectedObject,
                                strokeColor: color,
                              })
                            }
                          }}
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
                          className={`w-8 h-8 p-0 rounded-md ${
                            color === "transparent" ? "bg-transparent border-dashed" : ""
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            setFillColor(color)
                            if (selectedObject && selectedObject.type !== "text") {
                              updateSelectedObject({
                                ...selectedObject,
                                fillColor: color,
                              })
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Stroke Width</Label>
                      <span className="text-sm">{strokeWidth}px</span>
                    </div>
                    <Slider
                      value={[selectedObject.strokeWidth || strokeWidth]}
                      min={1}
                      max={20}
                      step={1}
                      onValueChange={(value) => {
                        setStrokeWidth(value[0])
                        if (selectedObject) {
                          updateSelectedObject({
                            ...selectedObject,
                            strokeWidth: value[0],
                          })
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Opacity</Label>
                      <span className="text-sm">{Math.round((selectedObject.opacity || opacity) * 100)}%</span>
                    </div>
                    <Slider
                      value={[(selectedObject.opacity || opacity) * 100]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => {
                        const newOpacity = value[0] / 100
                        setOpacity(newOpacity)
                        if (selectedObject) {
                          updateSelectedObject({
                            ...selectedObject,
                            opacity: newOpacity,
                          })
                        }
                      }}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {selectedObject.type === "text" && (
                <Collapsible open={isTextOpen} onOpenChange={setIsTextOpen} className="space-y-2">
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-1">
                    <h3 className="text-sm font-medium">
                      Text Properties
                      {selectedObject.isEditable && (
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                          Template Text
                        </Badge>
                      )}
                    </h3>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${isTextOpen ? "rotate-180" : ""}`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-1">
                    <div className="space-y-2">
                      <Label>Text Content</Label>
                      <Input
                        type="text"
                        value={selectedObject.text || ""}
                        onChange={(e) => handleTextStyleChange("text", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Font Size</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[selectedObject.fontSize || 16]}
                          min={8}
                          max={72}
                          step={1}
                          onValueChange={(value) => handleTextStyleChange("fontSize", value[0])}
                          className="flex-1"
                        />
                        <span className="text-sm w-8 text-center">{selectedObject.fontSize || 16}px</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Font Family</Label>
                      <Select
                        value={selectedObject.fontFamily || "sans-serif"}
                        onValueChange={(value) => handleTextStyleChange("fontFamily", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sans-serif">Sans Serif</SelectItem>
                          <SelectItem value="serif">Serif</SelectItem>
                          <SelectItem value="monospace">Monospace</SelectItem>
                          <SelectItem value="cursive">Cursive</SelectItem>
                          <SelectItem value="fantasy">Fantasy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        variant={selectedObject.fontWeight === "bold" ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleTextStyleChange("fontWeight", selectedObject.fontWeight === "bold" ? "normal" : "bold")
                        }
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={selectedObject.fontStyle === "italic" ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleTextStyleChange(
                            "fontStyle",
                            selectedObject.fontStyle === "italic" ? "normal" : "italic",
                          )
                        }
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={selectedObject.textDecoration === "underline" ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleTextStyleChange(
                            "textDecoration",
                            selectedObject.textDecoration === "underline" ? "none" : "underline",
                          )
                        }
                      >
                        <Underline className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={selectedObject.textAlign === "left" ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleTextStyleChange("textAlign", "left")}
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={selectedObject.textAlign === "center" ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleTextStyleChange("textAlign", "center")}
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={selectedObject.textAlign === "right" ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleTextStyleChange("textAlign", "right")}
                      >
                        <AlignRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              <Collapsible open={isPositionOpen} onOpenChange={setIsPositionOpen} className="space-y-2">
                <CollapsibleTrigger className="flex w-full items-center justify-between py-1">
                  <h3 className="text-sm font-medium">Position & Size</h3>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isPositionOpen ? "rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-1">
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">X</Label>
                        <Input
                          type="number"
                          value={getNumericValue(selectedObject.x)}
                          onChange={(e) => handlePositionChange("x", Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Y</Label>
                        <Input
                          type="number"
                          value={getNumericValue(selectedObject.y)}
                          onChange={(e) => handlePositionChange("y", Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  {(selectedObject.type === "rectangle" ||
                    selectedObject.type === "ellipse" ||
                    selectedObject.type === "image" ||
                    selectedObject.type === "sticker") && (
                    <div className="space-y-2">
                      <Label>Size</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Width</Label>
                          <Input
                            type="number"
                            value={getNumericValue(selectedObject.width)}
                            onChange={(e) => handlePositionChange("width", Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Height</Label>
                          <Input
                            type="number"
                            value={getNumericValue(selectedObject.height)}
                            onChange={(e) => handlePositionChange("height", Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedObject.type === "circle" && (
                    <div className="space-y-2">
                      <Label>Size</Label>
                      <div className="space-y-1">
                        <Label className="text-xs">Radius</Label>
                        <Input
                          type="number"
                          value={getNumericValue(selectedObject.radius)}
                          onChange={(e) => handlePositionChange("radius", Number(e.target.value))}
                        />
                      </div>
                    </div>
                  )}

                  {(selectedObject.type === "line" ||
                    selectedObject.type === "arrow" ||
                    selectedObject.type === "doubleArrow") && (
                    <div className="space-y-2">
                      <Label>End Point</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">X2</Label>
                          <Input
                            type="number"
                            value={getNumericValue(selectedObject.x2)}
                            onChange={(e) => handlePositionChange("x2", Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Y2</Label>
                          <Input
                            type="number"
                            value={getNumericValue(selectedObject.y2)}
                            onChange={(e) => handlePositionChange("y2", Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>

              <Collapsible open={isLayersOpen} onOpenChange={setIsLayersOpen} className="space-y-2">
                <CollapsibleTrigger className="flex w-full items-center justify-between py-1">
                  <h3 className="text-sm font-medium">Layers</h3>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isLayersOpen ? "rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-1">
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" onClick={bringToFront}>
                        Bring to Front
                      </Button>
                      <Button variant="outline" size="sm" onClick={sendToBack}>
                        Send to Back
                      </Button>
                      <Button variant="outline" size="sm" onClick={bringForward}>
                        Bring Forward
                      </Button>
                      <Button variant="outline" size="sm" onClick={sendBackward}>
                        Send Backward
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
              <Layers className="h-10 w-10 mb-2 opacity-20" />
              <p>Select an object to edit its properties</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
