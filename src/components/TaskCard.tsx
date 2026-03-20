'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkTaskAvailability, completeTaskAction } from '@/app/(protected)/tasks-feed/actions'
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, ExternalLink, Heart, Layers3, Loader2, Sparkles, UserPlus } from 'lucide-react'


type Task = {
  id: string
  task_type: string
  instagram_link: string
  points_cost: number
  users: {
    instagram_username: string | null
  } | null
}

type PreviousAttempt = {
  status: string | null
  review_notes: string | null
  verification_input: string | null
} | null

type TaskCardProps = {
  task: Task
  queueCount: number
  previousAttempt: PreviousAttempt
}

const MINIMUM_VISIT_MS = 2_000

function getDefaultVerificationValue(task: Task) {
  try {
    const parsed = new URL(task.instagram_link)
    const segments = parsed.pathname.split('/').filter(Boolean)

    if (task.task_type === 'follow') {
      const username = segments[0] ?? ''
      return username ? `@${username}` : ''
    }

    return task.instagram_link
  } catch {
    return task.task_type === 'like' ? task.instagram_link : ''
  }
}

function getInstruction(task: Task) {
  if (task.task_type === 'follow') {
    return {
      title: 'Follow this Instagram profile',
      description: 'Open the profile, follow it, then type the exact Instagram username (@creatorname) you followed to verify.',
      placeholder: '@username',
      label: 'Instagram username you followed',
    }
  }

  return {
    title: 'Like this Instagram post',
    description: 'Open the Instagram post or reel, like it, then paste that SAME exact post link below to verify.',
    placeholder: 'https://instagram.com/p/...',
    label: 'Instagram post link you liked',
  }
}


export default function TaskCard({ task, queueCount, previousAttempt }: TaskCardProps) {
  const router = useRouter()
  const [verificationInput, setVerificationInput] = useState(previousAttempt?.verification_input ?? '')
  const [openedLink, setOpenedLink] = useState(false)
  const [feedback, setFeedback] = useState(previousAttempt?.status === 'rejected' ? previousAttempt.review_notes ?? '' : '')
  const [successMessage, setSuccessMessage] = useState('')
  const [isOpeningTask, setIsOpeningTask] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [remainingMs, setRemainingMs] = useState(MINIMUM_VISIT_MS)

  const reward = task.task_type === 'follow' ? 2 : 1
  const Icon = task.task_type === 'follow' ? UserPlus : Heart
  const instruction = getInstruction(task)
  const countdownSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
  const canSubmit = openedLink && !!startTime && remainingMs <= 0 && !isProcessing && !isOpeningTask
  const storageKey = `task-verification-start-${task.id}`

  useEffect(() => {
    localStorage.removeItem(storageKey)
    setOpenedLink(false)
    setStartTime(null)
    setRemainingMs(MINIMUM_VISIT_MS)
  }, [storageKey])

  useEffect(() => {
    if (!startTime) {
      setRemainingMs(MINIMUM_VISIT_MS)
      return
    }

    const updateRemaining = () => {
      const elapsed = Date.now() - startTime
      setRemainingMs(Math.max(MINIMUM_VISIT_MS - elapsed, 0))
    }

    updateRemaining()

    const intervalId = window.setInterval(updateRemaining, 250)
    return () => window.clearInterval(intervalId)
  }, [startTime])

  async function handleOpenTask() {
    if (isOpeningTask || isProcessing) {
      return
    }

    setIsOpeningTask(true)

    try {
      const availability = await checkTaskAvailability(task.id)

      if (availability?.unavailable) {
        setSuccessMessage('')
        setFeedback('This task was already completed by someone else. Loading the next task now.')
        router.refresh()
        return
      }

      if (availability?.error) {
        setSuccessMessage('')
        setFeedback(availability.error)
        return
      }

      window.open(task.instagram_link, '_blank', 'noopener,noreferrer')
      const openedAt = Date.now()
      localStorage.setItem(storageKey, openedAt.toString())
      setOpenedLink(true)
      setStartTime(openedAt)
      setRemainingMs(MINIMUM_VISIT_MS)
      setVerificationInput((currentValue) => currentValue || getDefaultVerificationValue(task))
      setFeedback('')
      setSuccessMessage('')
    } finally {
      setIsOpeningTask(false)
    }
  }

  async function handleVerify() {
    if (isProcessing || isOpeningTask) {
      return
    }

    if (!openedLink) {
      setFeedback('Open the Instagram task first, complete it there, then submit your verification.')
      return
    }

    const storedStartTime = Number(localStorage.getItem(storageKey) ?? '')
    const activeStartTime = Number.isFinite(storedStartTime) && storedStartTime > 0 ? storedStartTime : startTime

    if (!activeStartTime) {
      setOpenedLink(false)
      setFeedback('Session expired after refresh. Open the Instagram link again to start a fresh verification attempt.')
      return
    }

    const elapsed = Date.now() - activeStartTime
    if (elapsed < MINIMUM_VISIT_MS) {
      setFeedback('Invalid attempt, please try again. Please spend at least 2 seconds on the page for zero error for properly verify.')
      return
    }

    // No more manual input check for One-Click flow
    setIsProcessing(true)

    try {
      const result = await completeTaskAction(task.id, verificationInput)

      if (result?.unavailable) {
        setSuccessMessage('')
        setFeedback('This task is no longer available. Loading the next task now.')
        router.refresh()
        return
      }

      if (result?.error) {
        setSuccessMessage('')
        setFeedback(result.error)
        return
      }

      setFeedback('')
      setSuccessMessage(`Task completed. You earned +${reward} point${reward > 1 ? 's' : ''}. Loading the next task...`)
      setVerificationInput('')
      setOpenedLink(false)
      setStartTime(null)
      setRemainingMs(MINIMUM_VISIT_MS)
      localStorage.removeItem(storageKey)
      router.refresh()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/60 transition-all duration-500 hover:shadow-indigo-500/10 hover:border-indigo-100">
      {/* 1. Header Stats Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${task.task_type === 'follow' ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white shadow-lg shadow-rose-200'}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Task Active</span>
            <div className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-xs font-bold text-slate-900">@{task.users?.instagram_username || 'anonymous'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-1.5 text-indigo-700">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-bold">+{reward} pts</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-slate-600">
            <Layers3 className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-bold">{queueCount} in queue</span>
          </div>
        </div>
      </div>

      {/* 2. Main Dashboard Content */}
      <div className="grid lg:grid-cols-[1.2fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        
        {/* Left Side: The Action */}
        <div className="p-8 space-y-8 bg-grid-slate-50">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {instruction.title}
            </h2>
            <p className="text-lg font-medium text-slate-500 max-w-md leading-relaxed">
              {instruction.description}
            </p>
          </div>

          <div className="space-y-4">
             <div className="group relative rounded-[2rem] border-2 border-indigo-100 bg-white p-6 transition-all hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10">
                <div className="absolute -top-3 left-6 flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-200">
                  <ExternalLink className="h-3 w-3" />
                  Instagram Target
                </div>
                
                <div className="flex items-center gap-5 py-2">
                   <div className={`flex h-14 w-14 items-center justify-center rounded-2xl group-hover:scale-110 transition-transform ${task.task_type === 'follow' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                      <Icon className="h-7 w-7" />
                   </div>
                   <div>
                      <p className="text-xl font-black text-slate-900 leading-none capitalize">{task.task_type} Profile</p>
                      <p className="text-sm font-bold text-indigo-500 mt-2 flex items-center gap-2">
                         <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                         Ready for visit
                      </p>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
                <button
                  type="button"
                  onClick={handleOpenTask}
                  disabled={isOpeningTask || isProcessing || openedLink}
                  className="flex items-center justify-center gap-3 rounded-[1.5rem] bg-slate-900 py-4 text-base font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 shadow-lg shadow-slate-200"
                >
                  {isOpeningTask ? <Loader2 className="h-5 w-5 animate-spin" /> : <ExternalLink className="h-5 w-5 leading-none" />}
                  {openedLink ? "Target Opened" : "Open Target"}
                </button>
             </div>
          </div>
        </div>

        {/* Right Side: Simple Confirmation */}
        <div className="p-8 flex flex-col justify-center items-center space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              Confirmation
            </div>
            <h3 className="text-xl font-black text-slate-900">Task Finished?</h3>
            <p className="text-sm font-medium text-slate-400">Click below to claim your points after visiting.</p>
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={!openedLink || isProcessing || isOpeningTask || remainingMs > 0}
            className="w-full h-24 rounded-[1.5rem] bg-emerald-600 text-2xl font-black text-white shadow-xl shadow-emerald-100 transition-all hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:grayscale disabled:hover:scale-100 flex items-center justify-center gap-4 group"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-8 w-8 group-hover:rotate-12 transition-transform" />
                <span>Claim {reward} Points</span>
              </>
            )}
          </button>
          
          <div className="w-full">
            {feedback && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700 animate-in fade-in slide-in-from-top-2">
                {feedback}
              </div>
            )}
            {successMessage && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-700 animate-in fade-in slide-in-from-top-2">
                {successMessage}
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}

