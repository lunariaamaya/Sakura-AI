"use client"

import { useState, useCallback, useRef } from "react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ImageIcon, Type, Upload, X, Sparkles, Loader2 } from "lucide-react"

export function EditorSection() {
  const { t } = useI18n()
  const [mode, setMode] = useState<"img2img" | "txt2img">("img2img")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [outputImages, setOutputImages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showRechargeHint, setShowRechargeHint] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) return
    if (!file.type.startsWith("image/")) return
    setUploadedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    if (mode === "img2img" && !uploadedFile) return

    const authCheck = await fetch("/api/credits")
    if (authCheck.status === 401) {
      const data = (await authCheck.json().catch(() => null)) as
        | { loginUrl?: string }
        | null
      window.location.href = data?.loginUrl ?? "/auth/sign-in/google?next=/#editor"
      return
    }

    if (!authCheck.ok) {
      setError("Failed to verify account state. Please try again.")
      setShowRechargeHint(false)
      return
    }

    const authData = (await authCheck.json()) as {
      credits?: { totalCredits?: number }
      costPerImage?: number
    }
    const totalCredits = authData?.credits?.totalCredits ?? 0
    const costPerImage = authData?.costPerImage ?? 50
    if (totalCredits < costPerImage) {
      setError("Insufficient credits. Please recharge and try again.")
      setShowRechargeHint(true)
      return
    }

    setError(null)
    setShowRechargeHint(false)
    setIsGenerating(true)
    setOutputImages([])

    try {
      const formData = new FormData()
      formData.append("prompt", prompt)
      if (mode === "img2img" && uploadedFile) formData.append("image", uploadedFile)

      const res = await fetch("/api/generate-image", {
        method: "POST",
        body: formData,
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href =
            data?.loginUrl ?? "/auth/sign-in/google?next=/#editor"
          return
        }
        if (res.status === 402 || data?.code === "INSUFFICIENT_CREDITS") {
          setError("Insufficient credits. Please recharge and try again.")
          setShowRechargeHint(true)
          return
        }
        setError(data?.error ?? "Generate failed")
        setShowRechargeHint(false)
        return
      }

      if (!Array.isArray(data?.images) || data.images.length === 0) {
        setError("No images returned")
        setShowRechargeHint(false)
        return
      }

      setOutputImages(data.images)
      if (typeof data?.remainingCredits === "number") {
        window.dispatchEvent(
          new CustomEvent("credits-updated", {
            detail: { totalCredits: data.remainingCredits },
          }),
        )
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generate failed")
      setShowRechargeHint(false)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section id="editor" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            {t("editor.title")}
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            {t("editor.subtitle")}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Panel */}
          <div className="rounded-2xl border border-primary/10 bg-card/60 p-6 shadow-[0_0_40px_rgba(244,114,182,0.15)] backdrop-blur-xl">
            <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
              <TabsList className="mb-6 w-full bg-secondary">
                <TabsTrigger value="img2img" className="flex-1 gap-1.5">
                  <ImageIcon className="size-3.5" />
                  {t("editor.tab.img2img")}
                </TabsTrigger>
                <TabsTrigger value="txt2img" className="flex-1 gap-1.5">
                  <Type className="size-3.5" />
                  {t("editor.tab.txt2img")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="img2img" className="space-y-4">
                {/* Model selector */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    {t("editor.model")}
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2.5">
                    <Sparkles className="size-4 text-primary" />
                    <span className="text-sm text-foreground">
                      Gemini 2.5 Flash Image (Nano Banana)
                    </span>
                  </div>
                </div>

                {/* Image upload */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium text-foreground">
                      {t("editor.upload")}
                    </label>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-1.5"
                    >
                      <Upload className="size-4" />
                      Add Image
                    </Button>
                  </div>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
                      isDragOver
                        ? "border-primary bg-primary/10"
                        : uploadedImage
                          ? "border-primary/30 bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-primary/5"
                    }`}
                    role="button"
                    tabIndex={0}
                    aria-label={t("editor.upload")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        fileInputRef.current?.click()
                      }
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFile(file)
                      }}
                    />
                    {uploadedImage ? (
                      <div className="relative w-full p-3">
                        <img
                          src={uploadedImage}
                          alt="Uploaded reference"
                          className="mx-auto max-h-[180px] rounded-lg object-contain"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setUploadedImage(null)
                            setUploadedFile(null)
                            if (fileInputRef.current) fileInputRef.current.value = ""
                          }}
                          className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 text-foreground transition-colors hover:bg-destructive hover:text-foreground"
                          aria-label={t("editor.remove")}
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 p-6">
                        <div className="rounded-full bg-primary/10 p-3">
                          <Upload className="size-6 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-foreground">
                            {t("editor.upload.hint")}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {t("editor.upload.formats")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prompt input */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    {t("editor.prompt")}
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t("editor.prompt.placeholder")}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim() || !uploadedFile}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {t("editor.generating")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Generate Now
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="txt2img" className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    {t("editor.model")}
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2.5">
                    <Sparkles className="size-4 text-primary" />
                    <span className="text-sm text-foreground">
                      Gemini 2.5 Flash Image (Nano Banana)
                    </span>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    {t("editor.prompt")}
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t("editor.prompt.placeholder")}
                    rows={5}
                    className="w-full resize-none rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {t("editor.generating")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Generate Now
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/10 bg-card/60 p-6 backdrop-blur-xl">
            <h3 className="mb-6 text-lg font-semibold text-foreground">
              Output Gallery
            </h3>
            <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 py-6">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="size-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">{t("editor.generating")}</p>
                </div>
              ) : outputImages.length > 0 ? (
                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                  {outputImages.map((src, idx) => (
                    <div
                      key={`${idx}-${src.slice(0, 32)}`}
                      className="overflow-hidden rounded-xl border border-border bg-secondary"
                    >
                      <img
                        src={src}
                        alt={`Generated ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="rounded-full bg-primary/10 p-4">
                    <Sparkles className="size-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">{t("editor.output.ready")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("editor.output.desc")}
                    </p>
                  </div>
                </>
              )}

              {error ? (
                <div className="w-full rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
                  {error}
                  {showRechargeHint ? (
                    <div className="mt-2">
                      <a className="underline" href="/pricing-v2">
                        Recharge now
                      </a>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
