"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { motion } from "framer-motion"

interface StickerPickerProps {
  onSelect: (stickerUrl: string) => void
  onClose: () => void
}

export function StickerPicker({ onSelect, onClose }: StickerPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState("emoji")

  // Sticker categories
  const categories = [
    { id: "emoji", name: "Emoji" },
    { id: "shapes", name: "Shapes" },
    { id: "arrows", name: "Arrows" },
    { id: "symbols", name: "Symbols" },
  ]

  // For the demo, we'll use placeholder SVGs
  const placeholderStickers = {
    emoji: [
      "/placeholder.svg?height=60&width=60&text=😊",
      "/placeholder.svg?height=60&width=60&text=😂",
      "/placeholder.svg?height=60&width=60&text=❤️",
      "/placeholder.svg?height=60&width=60&text=👍",
      "/placeholder.svg?height=60&width=60&text=🌟",
      "/placeholder.svg?height=60&width=60&text=🤔",
    ],
    shapes: [
      "/placeholder.svg?height=60&width=60&text=⭐",
      "/placeholder.svg?height=60&width=60&text=❤️",
      "/placeholder.svg?height=60&width=60&text=☁️",
      "/placeholder.svg?height=60&width=60&text=💎",
      "/placeholder.svg?height=60&width=60&text=⬡",
      "/placeholder.svg?height=60&width=60&text=⬢",
    ],
    arrows: [
      "/placeholder.svg?height=60&width=60&text=➡️",
      "/placeholder.svg?height=60&width=60&text=⬅️",
      "/placeholder.svg?height=60&width=60&text=⬆️",
      "/placeholder.svg?height=60&width=60&text=⬇️",
      "/placeholder.svg?height=60&width=60&text=↩️",
      "/placeholder.svg?height=60&width=60&text=↔️",
    ],
    symbols: [
      "/placeholder.svg?height=60&width=60&text=✓",
      "/placeholder.svg?height=60&width=60&text=✗",
      "/placeholder.svg?height=60&width=60&text=+",
      "/placeholder.svg?height=60&width=60&text=-",
      "/placeholder.svg?height=60&width=60&text=?",
      "/placeholder.svg?height=60&width=60&text=!",
    ],
  }

  return (
    <div className="w-[90vw] max-w-[300px] bg-white dark:bg-gray-900 rounded-lg shadow-lg border overflow-hidden">
      <div className="p-3 font-medium chitran-gradient dark:chitran-gradient-dark text-white">Choose a Sticker</div>

      <div className="flex border-b overflow-x-auto">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "ghost"}
            className="flex-1 rounded-none h-10 min-w-[80px]"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      <ScrollArea className="h-[240px] p-3">
        <div className="grid grid-cols-3 gap-3">
          {placeholderStickers[selectedCategory as keyof typeof placeholderStickers].map((sticker, index) => (
            <motion.div key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                className="w-full h-20 p-1 flex items-center justify-center"
                onClick={() => onSelect(sticker)}
              >
                <img
                  src={sticker || "/placeholder.svg"}
                  alt={`Sticker ${index + 1}`}
                  className="max-w-full max-h-full"
                />
              </Button>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
