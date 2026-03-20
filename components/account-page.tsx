"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Sparkles, Loader2, Upload, X, ImageIcon, Type, Download, Trash2, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

const HISTORY_KEY = "sakura-image-history-v1"
const MAX_HISTORY = 9
const CREDIT_COST = Number(process.env.NEXT_PUBLIC_CREDIT_COST ?? 50)

type HistoryItem = {
  id: string
  url: string
  prompt: string
  createdAt: number
}

type EditorMode = "txt2img" | "img2img"

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as HistoryItem[]
  } catch {
    return []
  }
}

function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)))
}

function extractTotalCredits(data: unknown): number {
  if (!data) return 0
  const row = Array.isArray(data) ? data[0] : data
  const free = Number((row as any)?.free_credits ?? (row as any)?.freeCredits ?? 0)
  const paid = Number((row as any)?.paid_credits ?? (row as any)?.paidCredits ?? 0)
  const total = Number((row as any)?.total_credits ?? (row as any)?.totalCredits ?? (free + paid))
  return Number.isFinite(total) ? total : 0
}

export function AccountPage({
  name,
  email,
  avatarUrl,
}: {
  name: string
  email?: string
  avatarUrl?: string
}) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [mode, setMode] = useState<EditorMode>("txt2img")
  const [prompt, setPrompt] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [selectedImage, setSelectedImage] = useState<HistoryItem | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    supabase.rpc("get_my_credits").then(({ data }) => {
      if (data) setCredits(extractTotalCredits(data))
    })
  }, [])

  const handleFile = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024 || !file.type.startsWith("image/")) return
    setUploadedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setUploadedImage(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    if (mode === "img2img" && !uploadedFile && !uploadedImage) return

    const supabase = getSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = "/auth/sign-in/google?next=/account"; return }

    const { data: creditsData, error: creditsError } = await supabase.rpc("get_my_credits")
    if (creditsError) { setError("Failed to check credits."); return }

    const total = extractTotalCredits(creditsData)
    if (total < CREDIT_COST) { setError("Insufficient credits. Please recharge."); return }

    const { error: consumeError } = await supabase.rpc("consume_credits", {
      p_amount: CREDIT_COST,
      p_remark: "account page generation",
    })
    if (consumeError) { setError(consumeError.message); return }

    setError(null)
    setIsGenerating(true)

    try {
      let requestInit: RequestInit = { method: "POST" }

      if (mode === "img2img") {
        if (uploadedFile) {
          const formData = new FormData()
          formData.append("prompt", prompt)
          formData.append("image", uploadedFile)
          requestInit.body = formData
        } else {
          requestInit.headers = { "Content-Type": "application/json" }
          requestInit.body = JSON.stringify({ prompt, imageDataUrl: uploadedImage })
        }
      } else {
        requestInit.headers = { "Content-Type": "application/json" }
        requestInit.body = JSON.stringify({ prompt })
      }

      requestInit.headers = { ...(requestInit.headers ?? {}), "x-credits-consumed": "1" }

      const res = await fetch("/api/generate-image", requestInit)
      const data = await res.json().catch(() => null)

      if (!res.ok || !Array.isArray(data?.images) || data.images.length === 0) {
        setError(data?.error ?? "Generation failed.")
        return
      }

      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        url: data.images[0],
        prompt,
        createdAt: Date.now(),
      }

      setHistory((prev) => {
        const next = [newItem, ...prev].slice(0, MAX_HISTORY)
        saveHistory(next)
        return next
      })

      const { data: latest } = await supabase.rpc("get_my_credits")
      if (latest) setCredits(extractTotalCredits(latest))

      setPrompt("")
      setUploadedImage(null)
      setUploadedFile(null)
    } catch {
      setError("Generation failed. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((item) => item.id !== id)
      saveHistory(next)
      return next
    })
    if (selectedImage?.id === id) setSelectedImage(null)
  }

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <main className="min-h-screen bg-background pt-20 pb-16">
      {/* Profile header */}
      <div className="mx-auto max-w-3xl px-4 pt-12 pb-10 text-center">
        <Avatar className="mx-auto mb-4 size-24 ring-4 ring-primary/20">
          <AvatarImage src={avatarUrl} alt={name} referrerPolicy="no-referrer" />
          <AvatarFallback className="text-2xl font-semibold">
            {initials || <UserRound className="size-10 text-muted-foreground" />}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold text-foreground">{name}</h1>
        {email && <p className="mt-1 text-sm text-muted-foreground">{email}</p>}
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="size-3" />
          {credits !== null ? `${credits} credits` : "Loading credits…"}
        </div>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/auth/sign-out?next=/">Sign out</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/">Home</a>
          </Button>
        </div>
      </div>

      {/* History grid */}
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Generation History</h2>

        {history.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
            <ImageIcon className="mb-3 size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No images yet. Generate your first one below!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-border bg-secondary"
                onClick={() => setSelectedImage(item)}
              >
                <img
                  src={item.url}
                  alt={item.prompt}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex justify-end p-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id) }}
                      className="rounded-full bg-black/50 p-1.5 text-white hover:bg-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <p className="line-clamp-2 px-2 pb-2 text-xs text-white/90">{item.prompt}</p>
                </div>
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: MAX_HISTORY - history.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="aspect-square rounded-xl border border-dashed border-border/40 bg-secondary/30"
              />
            ))}
          </div>
        )}
      </div>

      {/* Image preview modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-2xl bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selectedImage.url} alt={selectedImage.prompt} className="max-h-[70vh] w-full object-contain" />
            <div className="p-4">
              <p className="text-sm text-muted-foreground">{selectedImage.prompt}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a href={selectedImage.url} download={`sakura-${selectedImage.id}.png`} target="_blank" rel="noreferrer">
                    <Download className="mr-1.5 size-3.5" /> Download
                  </a>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedImage(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generator workspace */}
      <div className="mx-auto mt-12 max-w-3xl px-4">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Generate Image</h2>
        <div className="rounded-2xl border border-primary/10 bg-card/60 p-6 shadow-[0_0_40px_rgba(244,114,182,0.1)] backdrop-blur-xl">
          <Tabs value={mode} onValueChange={(v) => setMode(v as EditorMode)}>
            <TabsList className="mb-5 w-full bg-secondary">
              <TabsTrigger value="txt2img" className="flex-1 gap-1.5">
                <Type className="size-3.5" /> Text to Image
              </TabsTrigger>
              <TabsTrigger value="img2img" className="flex-1 gap-1.5">
                <ImageIcon className="size-3.5" /> Image to Image
              </TabsTrigger>
            </TabsList>

            <TabsContent value="txt2img" className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create…"
                rows={4}
                className="w-full resize-none rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </TabsContent>

            <TabsContent value="img2img" className="space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                onDragLeave={() => setIsDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
                  isDragOver ? "border-primary bg-primary/10" : uploadedImage ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
                {uploadedImage ? (
                  <div className="relative w-full p-3">
                    <img src={uploadedImage} alt="uploaded" className="mx-auto max-h-[140px] rounded-lg object-contain" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setUploadedImage(null); setUploadedFile(null) }}
                      className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 hover:bg-destructive hover:text-white"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-6 text-center">
                    <Upload className="size-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Drop image here or click to upload</p>
                  </div>
                )}
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe how to transform the image…"
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || (mode === "img2img" && !uploadedFile && !uploadedImage)}
            className="mt-4 w-full gap-2"
            size="lg"
          >
            {isGenerating ? (
              <><Loader2 className="size-4 animate-spin" /> Generating…</>
            ) : (
              <><Sparkles className="size-4" /> Generate ({CREDIT_COST} credits)</>
            )}
          </Button>
        </div>
      </div>
    </main>
  )
}
