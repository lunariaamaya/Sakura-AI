"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ImageIcon, Type, Upload, X, Sparkles, Loader2 } from "lucide-react"
import { PayPalCheckoutDialog } from "@/components/paypal-checkout-dialog"

type EditorMode = "img2img" | "txt2img"

type EditorDraft = {
  mode: EditorMode
  prompt: string
  uploadedImage: string | null
  updatedAt: number
}

const EDITOR_DRAFT_KEY = "sakura-editor-draft-v1"
const CREDIT_COST = Number(process.env.NEXT_PUBLIC_CREDIT_COST ?? 50)

function extractTotalCredits(data: unknown): number {
  if (!data) return 0
  const row = Array.isArray(data) ? data[0] : data
  const free = Number((row as any)?.free_credits ?? (row as any)?.freeCredits ?? 0)
  const paid = Number((row as any)?.paid_credits ?? (row as any)?.paidCredits ?? 0)
  const total = Number(
    (row as any)?.total_credits ?? (row as any)?.totalCredits ?? (free + paid),
  )
  return Number.isFinite(total) ? total : 0
}

export function EditorSection() {
  const { t, locale } = useI18n()
  const isZh = locale === "zh"
  const [mode, setMode] = useState<EditorMode>("img2img")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [outputImages, setOutputImages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showRechargeHint, setShowRechargeHint] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const rechargePack = {
    title: isZh ? "入门点数包" : "Starter Pack",
    description: isZh ? "200 点积分包" : "200 credits pack",
    amount: 4.99,
    sku: "credits-starter-200",
  }
  rechargePack.title = isZh ? "小额包" : "Small Pack"
  rechargePack.description = isZh ? "750 积分包" : "750 credits pack"

  const saveDraft = useCallback(
    (nextDraft?: Partial<EditorDraft>) => {
      const draft: EditorDraft = {
        mode,
        prompt,
        uploadedImage,
        updatedAt: Date.now(),
        ...nextDraft,
      }

      if (!draft.prompt.trim() && !draft.uploadedImage) {
        window.localStorage.removeItem(EDITOR_DRAFT_KEY)
        return
      }

      window.localStorage.setItem(EDITOR_DRAFT_KEY, JSON.stringify(draft))
    },
    [mode, prompt, uploadedImage],
  )

  useEffect(() => {
    const rawDraft = window.localStorage.getItem(EDITOR_DRAFT_KEY)
    if (!rawDraft) return

    try {
      const parsed = JSON.parse(rawDraft) as Partial<EditorDraft>
      if (parsed.mode === "img2img" || parsed.mode === "txt2img") {
        setMode(parsed.mode)
      }
      if (typeof parsed.prompt === "string") {
        setPrompt(parsed.prompt)
      }
      if (typeof parsed.uploadedImage === "string" && parsed.uploadedImage) {
        setUploadedImage(parsed.uploadedImage)
      }
    } catch {
      window.localStorage.removeItem(EDITOR_DRAFT_KEY)
    }
  }, [])

  useEffect(() => {
    saveDraft()
  }, [mode, prompt, uploadedImage, saveDraft])

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
    [handleFile],
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
    if (mode === "img2img" && !uploadedFile && !uploadedImage) return

    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      saveDraft({ mode, prompt, uploadedImage })
      window.location.href = "/auth/sign-in/google?next=%2F%23editor"
      return
    }

    const { data: creditsData, error: creditsError } = await supabase.rpc("get_my_credits")
    if (creditsError) {
      setError(t("editor.error.authCheck"))
      setShowRechargeHint(false)
      return
    }

    const totalCredits = extractTotalCredits(creditsData)
    if (totalCredits < CREDIT_COST) {
      setError(t("editor.error.insufficient"))
      setShowRechargeHint(true)
      return
    }

    const { error: consumeError } = await supabase.rpc("consume_credits", {
      p_amount: CREDIT_COST,
      p_remark: "使用AI功能",
    })

    if (consumeError) {
      setError(
        consumeError.message?.toLowerCase().includes("insufficient")
          ? t("editor.error.insufficient")
          : consumeError.message,
      )
      setShowRechargeHint(true)
      return
    }

    setError(null)
    setShowRechargeHint(false)
    setIsGenerating(true)
    setOutputImages([])

    try {
      const requestInit: RequestInit = { method: "POST" }

      if (mode === "img2img") {
        if (uploadedFile) {
          const formData = new FormData()
          formData.append("prompt", prompt)
          formData.append("image", uploadedFile)
          requestInit.body = formData
        } else {
          requestInit.headers = { "Content-Type": "application/json" }
          requestInit.body = JSON.stringify({
            prompt,
            imageDataUrl: uploadedImage,
          })
        }
      } else {
        requestInit.headers = { "Content-Type": "application/json" }
        requestInit.body = JSON.stringify({ prompt })
      }

      requestInit.headers = {
        ...(requestInit.headers ?? {}),
        "x-credits-consumed": "1",
      }

      const res = await fetch("/api/generate-image", requestInit)

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        if (res.status === 401) {
          saveDraft({ mode, prompt, uploadedImage })
          window.location.href =
            data?.loginUrl ?? "/auth/sign-in/google?next=%2F%23editor"
          return
        }
        if (res.status === 402 || data?.code === "INSUFFICIENT_CREDITS") {
          setError(t("editor.error.insufficient"))
          setShowRechargeHint(true)
          return
        }
        if (typeof data?.error === "string" && data.error.includes("No images")) {
          setError(t("editor.error.noImages"))
          setShowRechargeHint(false)
          return
        }
        setError(t("editor.error.generate"))
        setShowRechargeHint(false)
        return
      }

      if (!Array.isArray(data?.images) || data.images.length === 0) {
        setError(t("editor.error.noImages"))
        setShowRechargeHint(false)
        return
      }

      setOutputImages(data.images)
      window.localStorage.removeItem(EDITOR_DRAFT_KEY)
      const { data: latestCredits } = await supabase.rpc("get_my_credits")
      const refreshedTotal = extractTotalCredits(latestCredits)
      window.dispatchEvent(
        new CustomEvent("credits-updated", {
          detail: { totalCredits: refreshedTotal },
        }),
      )
    } catch {
      setError(t("editor.error.generate"))
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
          <div className="rounded-2xl border border-primary/10 bg-card/60 p-6 shadow-[0_0_40px_rgba(244,114,182,0.15)] backdrop-blur-xl">
            <Tabs value={mode} onValueChange={(v) => setMode(v as EditorMode)}>
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
                      {t("editor.addImage")}
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
                          alt={t("editor.uploadedAlt")}
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
                  disabled={isGenerating || !prompt.trim() || (!uploadedFile && !uploadedImage)}
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
                      {t("editor.generateNow")}
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
                      {t("editor.generateNow")}
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/10 bg-card/60 p-6 backdrop-blur-xl">
            <h3 className="mb-6 text-lg font-semibold text-foreground">
              {t("editor.output")}
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
                        alt={`${t("editor.generatedAlt")} ${idx + 1}`}
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
                      <div className="flex flex-wrap items-center gap-3">
                        <a className="underline" href="/pricing-v2">
                          {t("editor.rechargeNow")}
                        </a>
                        <PayPalCheckoutDialog
                          title={rechargePack.title}
                          description={rechargePack.description}
                          amount={rechargePack.amount}
                          sku={rechargePack.sku}
                          buttonLabel={isZh ? "PayPal 充值" : "Pay with PayPal"}
                        />
                      </div>
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
