import { createContext, useContext, useState } from "react"

interface DisplayContextType {
  // Add your display state here
  currentQueue: string
  setCurrentQueue: (queue: string) => void
  // Add other display-related state
}

const DisplayContext = createContext<DisplayContextType | undefined>(undefined)

export function DisplayProvider({ children }: { children: React.ReactNode }) {
  const [currentQueue, setCurrentQueue] = useState("")
  
  return (
    <DisplayContext.Provider value={{
      currentQueue,
      setCurrentQueue,
      // Add other state and methods
    }}>
      {children}
    </DisplayContext.Provider>
  )
}

export function useDisplay() {
  const context = useContext(DisplayContext)
  if (context === undefined) {
    throw new Error('useDisplay must be used within a DisplayProvider')
  }
  return context
} 