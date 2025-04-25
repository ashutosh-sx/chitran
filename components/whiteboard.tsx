"use client"

import { useEffect, useRef, useState } from "react"
import { ToolbarTop } from "./toolbar-top"
import { ShapesPanel } from "./shapes-panel"
import { PropertiesPanel } from "./properties-panel"
import { Canvas } from "./canvas"
import { ThemeProvider } from "@/components/theme-provider"
import { useToast } from "@/hooks/use-toast"
import { MobileControls } from "./mobile-controls"
import { useMobile } from "@/hooks/use-mobile"
import { WhiteboardProvider } from "@/context/whiteboard-context"
import { Toaster } from "@/components/ui/toaster"
import { motion, AnimatePresence } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function Whiteboard() {
  const isMobile = useMobile()
  const { toast } = useToast()
  const containerRef = useRef<HTMLDivElement>(null)
  const [showLeftPanel, setShowLeftPanel] = useState(!isMobile)
  const [showRightPanel, setShowRightPanel] = useState(!isMobile)

  const isSmallScreen = useMediaQuery("(max-width: 640px)")

  useEffect(() => {
    // Skip keyboard shortcuts on mobile devices
    if (isSmallScreen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "s":
            e.preventDefault()
            toast({
              title: "Canvas saved",
              description: "Your canvas has been saved successfully.",
            })
            break
          case "z":
            e.preventDefault()
            // Undo is handled in whiteboard context
            break
          case "y":
            e.preventDefault()
            // Redo is handled in whiteboard context
            break
          case "e":
            e.preventDefault()
            toast({
              title: "Canvas exported",
              description: "Your canvas has been exported successfully.",
            })
            break
        }
      } else {
        // Single key shortcuts
        switch (e.key.toLowerCase()) {
          case "v":
            // Select tool
            break
          case "p":
            // Pen tool
            break
          case "e":
            // Eraser tool
            break
          case "r":
            // Rectangle tool
            break
          case "c":
            // Circle tool
            break
          case "t":
            // Text tool
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toast, isSmallScreen])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      storageKey="chitran-theme"
    >
      <WhiteboardProvider>
        <div
          className="flex flex-col h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
          ref={containerRef}
        >
          <ToolbarTop
            onToggleLeftPanel={() => setShowLeftPanel(!showLeftPanel)}
            onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
          />

          <div className="flex flex-1 overflow-hidden">
            <AnimatePresence>
              {showLeftPanel && !isSmallScreen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="border-r border-border h-full overflow-hidden dark:bg-gray-900 bg-white"
                >
                  <ShapesPanel className="w-full h-full overflow-y-auto" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 relative overflow-hidden">
              <Canvas />
              {isSmallScreen && <MobileControls />}
            </div>

            <AnimatePresence>
              {showRightPanel && !isSmallScreen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="border-l border-border h-full overflow-hidden dark:bg-gray-900 bg-white"
                >
                  <PropertiesPanel className="w-full h-full overflow-y-auto" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <Toaster />
      </WhiteboardProvider>
    </ThemeProvider>
  )
}
