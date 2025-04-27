"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, Search, Download, CheckCircle } from "lucide-react"

interface WalkthroughModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WalkthroughModal({ isOpen, onClose }: WalkthroughModalProps) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: "Welcome to ShardNet",
      description:
        "ShardNet is a decentralized file-sharing application that enables you to upload, download, and search for files through a distributed network.",
      icon: <img src="/images/shardnet-logo.png" alt="ShardNet Logo" className="h-16 w-16 mx-auto mb-4" />,
    },
    {
      title: "Upload Files",
      description:
        "Share your files with the network. Your files will be chunked and distributed across the network for efficient storage and retrieval.",
      icon: <Upload className="h-16 w-16 mx-auto mb-4 text-primary" />,
    },
    {
      title: "Search Files",
      description: "Search for files shared by other users in the network. You can search by filename or keywords.",
      icon: <Search className="h-16 w-16 mx-auto mb-4 text-primary" />,
    },
    {
      title: "Download Files",
      description:
        "Download files from the network. Files are retrieved in chunks from multiple peers for faster downloads.",
      icon: <Download className="h-16 w-16 mx-auto mb-4 text-primary" />,
    },
    {
      title: "You're All Set!",
      description: "You're now ready to use ShardNet. Connect to the network to start sharing and downloading files.",
      icon: <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />,
    },
  ]

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      onClose()
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const currentStep = steps[step]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{currentStep.title}</DialogTitle>
          <DialogDescription className="text-center">
            Step {step + 1} of {steps.length}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {currentStep.icon}
          <p className="text-center">{currentStep.description}</p>
        </div>

        <DialogFooter className="flex flex-row justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 0}>
            Back
          </Button>
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i === step ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}`}
              />
            ))}
          </div>
          <Button onClick={handleNext}>{step === steps.length - 1 ? "Get Started" : "Next"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
