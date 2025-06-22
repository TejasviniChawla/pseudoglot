"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Volume2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Brain,
  Home,
  Settings,
  Trophy,
  Clock,
  Target,
} from "lucide-react"
import Link from "next/link"

// Sample flashcard data
const sampleFlashcards = [
  {
    id: 1,
    word: "hello",
    translation: "bonjour",
    uses: "This is used to greet people when meeting them for the first time or when starting a conversation.",
    pronunciation: "data:audio/mp3;base64,//sample_base64_audio_data",
    difficulty: "easy",
    lastReviewed: new Date().toISOString(),
    nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    word: "goodbye",
    translation: "au revoir",
    uses: "Used when parting ways with someone or ending a conversation. A polite way to conclude interactions.",
    pronunciation: "data:audio/mp3;base64,//sample_base64_audio_data",
    difficulty: "easy",
    lastReviewed: new Date().toISOString(),
    nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    word: "thank you",
    translation: "merci",
    uses: "Express gratitude and appreciation. Can be used in formal and informal situations to show politeness.",
    pronunciation: "data:audio/mp3;base64,//sample_base64_audio_data",
    difficulty: "medium",
    lastReviewed: new Date().toISOString(),
    nextReview: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    word: "beautiful",
    translation: "belle/beau",
    uses: "Used to describe something or someone as attractive or pleasing. 'Belle' for feminine nouns, 'beau' for masculine.",
    pronunciation: "data:audio/mp3;base64,//sample_base64_audio_data",
    difficulty: "hard",
    lastReviewed: new Date().toISOString(),
    nextReview: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    word: "restaurant",
    translation: "restaurant",
    uses: "A place where people pay to sit and eat meals. Same word in both languages but pronounced differently.",
    pronunciation: "data:audio/mp3;base64,//sample_base64_audio_data",
    difficulty: "medium",
    lastReviewed: new Date().toISOString(),
    nextReview: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  },
]

export default function FlashcardsPage() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studySession, setStudySession] = useState({
    cardsStudied: 0,
    correctAnswers: 0,
    startTime: new Date(),
  })
  const [showAnswer, setShowAnswer] = useState(false)

  const currentCard = sampleFlashcards[currentCardIndex]
  const progress = ((currentCardIndex + 1) / sampleFlashcards.length) * 100

  const playPronunciation = () => {
    // In a real implementation, you would decode the base64 audio and play it
    // For demo purposes, we'll just show a visual indication
    const button = document.querySelector(".pronunciation-btn")
    button?.classList.add("animate-pulse")
    setTimeout(() => {
      button?.classList.remove("animate-pulse")
    }, 1000)
  }

  const handleDifficultyResponse = (difficulty: "easy" | "medium" | "hard") => {
    setStudySession((prev) => ({
      ...prev,
      cardsStudied: prev.cardsStudied + 1,
      correctAnswers: difficulty === "easy" ? prev.correctAnswers + 1 : prev.correctAnswers,
    }))

    // Move to next card
    if (currentCardIndex < sampleFlashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1)
      setIsFlipped(false)
      setShowAnswer(false)
    } else {
      // Session complete
      alert(
        `Session Complete! You studied ${studySession.cardsStudied + 1} cards with ${studySession.correctAnswers + (difficulty === "easy" ? 1 : 0)} correct answers.`,
      )
    }
  }

  const nextCard = () => {
    if (currentCardIndex < sampleFlashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1)
      setIsFlipped(false)
      setShowAnswer(false)
    }
  }

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1)
      setIsFlipped(false)
      setShowAnswer(false)
    }
  }

  const flipCard = () => {
    setIsFlipped(!isFlipped)
    if (!isFlipped) {
      setShowAnswer(true)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "hard":
        return "bg-rose-100 text-rose-800 border-rose-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 relative overflow-hidden">
      {/* World Map Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <img
          src="/images/world-hello-map.png"
          alt="World map with hello in different languages"
          className="w-full h-full object-contain max-w-4xl"
        />
      </div>

      {/* Subtle animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-2 h-2 bg-teal-300 rounded-full animate-ping opacity-20"></div>
        <div className="absolute top-20 right-20 w-2 h-2 bg-cyan-300 rounded-full animate-ping opacity-15 animation-delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-2 h-2 bg-blue-300 rounded-full animate-ping opacity-20 animation-delay-2000"></div>
        <div className="absolute bottom-40 right-40 w-2 h-2 bg-emerald-300 rounded-full animate-ping opacity-15 animation-delay-3000"></div>
      </div>

      {/* Header */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover:bg-white/80">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-teal-600" />
              <span className="text-xl font-bold text-gray-900">Flashcards</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-700 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm border border-teal-100">
              <Trophy className="h-4 w-4 text-teal-600" />
              <span>
                {studySession.correctAnswers}/{studySession.cardsStudied} correct
              </span>
            </div>
            <Button variant="ghost" size="sm" className="hover:bg-white/80">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </nav>
      </header>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 mb-8 relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-teal-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Card {currentCardIndex + 1} of {sampleFlashcards.length}
            </span>
            <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Flashcard Area */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Card Stats */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Badge className={`${getDifficultyColor(currentCard.difficulty)} border`}>
              {currentCard.difficulty.charAt(0).toUpperCase() + currentCard.difficulty.slice(1)}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-700 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm border border-teal-100">
              <Clock className="h-4 w-4 text-teal-600" />
              <span>Next review in 1 day</span>
            </div>
          </div>

          {/* Flashcard */}
          <div className="relative mb-8" style={{ perspective: "1000px" }}>
            <div
              className={`relative w-full h-96 cursor-pointer transition-all duration-700 hover:scale-105 ${
                isFlipped ? "rotate-y-180" : ""
              }`}
              onClick={flipCard}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front of card */}
              <Card
                className="absolute inset-0 w-full h-full bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow border border-teal-100"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(0deg)",
                }}
              >
                <CardContent className="h-full flex flex-col items-center justify-center p-8">
                  <div className="text-center">
                    <div className="mb-4">
                      <Target className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 uppercase tracking-wide font-medium">English</p>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">{currentCard.word}</h1>
                    <p className="text-gray-600 mb-8">Click to reveal translation</p>
                    <div className="flex items-center justify-center">
                      <RotateCcw className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">Tap to flip</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Back of card */}
              <Card
                className="absolute inset-0 w-full h-full bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow border border-cyan-100"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <CardContent className="h-full flex flex-col items-center justify-center p-8">
                  <div className="text-center w-full">
                    <div className="mb-4">
                      <Brain className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 uppercase tracking-wide font-medium">French</p>
                    </div>
                    <h1 className="text-4xl font-bold text-cyan-900 mb-4">{currentCard.translation}</h1>

                    {/* Pronunciation Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="pronunciation-btn mb-6 bg-white/90 hover:bg-cyan-50 hover:scale-110 transition-all duration-300 border-2 border-cyan-200 hover:border-cyan-400"
                      onClick={(e) => {
                        e.stopPropagation()
                        playPronunciation()
                      }}
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Play Pronunciation
                    </Button>

                    {/* Usage Information */}
                    <div className="bg-cyan-50/80 backdrop-blur-sm rounded-lg p-4 mb-4 border border-cyan-100">
                      <h3 className="font-semibold text-gray-900 mb-2">Usage:</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{currentCard.uses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={prevCard}
              disabled={currentCardIndex === 0}
              className="bg-white/90 hover:bg-teal-50 border-teal-200"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm border border-teal-100">
              <span className="text-sm text-gray-700 font-medium">
                {currentCardIndex + 1} / {sampleFlashcards.length}
              </span>
            </div>

            <Button
              variant="outline"
              onClick={nextCard}
              disabled={currentCardIndex === sampleFlashcards.length - 1}
              className="bg-white/90 hover:bg-teal-50 border-teal-200"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Difficulty Response Buttons */}
          {showAnswer && (
            <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-teal-100 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">How well did you know this word?</h3>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-16 flex-col border-rose-200 hover:bg-rose-50 hover:border-rose-300 bg-white/90 hover:scale-110 transition-all duration-300"
                  onClick={() => handleDifficultyResponse("hard")}
                >
                  <span className="font-semibold text-rose-700">😅 Hard</span>
                  <span className="text-xs text-rose-600">Review in 1 day</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 flex-col border-amber-200 hover:bg-amber-50 hover:border-amber-300 bg-white/90 hover:scale-110 transition-all duration-300"
                  onClick={() => handleDifficultyResponse("medium")}
                >
                  <span className="font-semibold text-amber-700">🤔 Medium</span>
                  <span className="text-xs text-amber-600">Review in 3 days</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 flex-col border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 bg-white/90 hover:scale-110 transition-all duration-300"
                  onClick={() => handleDifficultyResponse("easy")}
                >
                  <span className="font-semibold text-emerald-700">😊 Easy</span>
                  <span className="text-xs text-emerald-600">Review in 1 week</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Study Session Stats */}
      <div className="container mx-auto px-4 pb-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-teal-50/90 via-cyan-50/90 to-blue-50/90 backdrop-blur-sm border-0 shadow-lg border border-teal-100">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Session Progress</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-teal-600">{studySession.cardsStudied}</div>
                  <div className="text-sm text-gray-600">Cards Studied</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">{studySession.correctAnswers}</div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cyan-600">
                    {Math.round((Date.now() - studySession.startTime.getTime()) / 1000 / 60)}m
                  </div>
                  <div className="text-sm text-gray-600">Time Spent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
