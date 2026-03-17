'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkTaskAvailability, completeTaskAction } from '@/app/(protected)/tasks-feed/actions'
import { AlertCircle, ArrowRight, CheckCircle2, ExternalLink, Heart, Loader2, Sparkles, UserPlus } from 'lucide-react'

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

const MINIMUM_VISIT_MS = 3_000

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
      description: 'Open the profile, follow it on Instagram, then type the exact username you followed.',
      placeholder: '@username',
      label: 'Instagram username you followed',
    }
  }

  return {
    title: 'Like this Instagram post',
    description: 'Open the Instagram post or reel, like it, then paste that exact post link below.',
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

    if (!verificationInput.trim()) {
      setFeedback(
        task.task_type === 'follow'
          ? 'Open the profile, follow it, then verify using the Instagram username shown for this task.'
          : 'Open the post, like it, then verify using the same Instagram post link.'
      )
      return
    }

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
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <div className={`mt-1 rounded-2xl p-3 ${task.task_type === 'follow' ? 'bg-indigo-500/20 text-indigo-200' : 'bg-rose-500/20 text-rose-200'}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-300">Current task</p>
              <h3 className="mt-2 text-2xl font-semibold">{instruction.title}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{instruction.description}</p>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <p><span className="font-semibold text-white">Reward:</span> +{reward} point{reward > 1 ? 's' : ''}</p>
            <p><span className="font-semibold text-white">Queue:</span> {queueCount} task{queueCount > 1 ? 's' : ''} waiting</p>
            <p><span className="font-semibold text-white">Profile:</span> @{task.users?.instagram_username || 'anonymous'}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">Task link</p>
                <p className="mt-1 text-sm text-slate-500">
                  Open the Instagram target first, complete the action there, then verify it here.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:min-w-[220px]">
                <button
                  type="button"
                  onClick={handleOpenTask}
                  disabled={isOpeningTask || isProcessing || openedLink}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isOpeningTask ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking task
                    </>
                  ) : openedLink ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Instagram Opened
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Instagram
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={!openedLink || isProcessing || isOpeningTask}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Done
                    </>
                  )}
                </button>
              </div>
            </div>
            <a
              href={task.instagram_link}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 block break-all rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 underline decoration-blue-200 underline-offset-2 hover:text-blue-800"
            >
              {task.instagram_link}
            </a>
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-semibold">Verification timer</p>
              <p className="mt-1">
                Please spend at least 2 seconds on the page for zero error for properly verify.
              </p>
              <p className="mt-1">
                Minimum required time: 3 seconds.
                {openedLink
                  ? remainingMs > 0
                    ? ` Countdown: ${countdownSeconds}s remaining before Done can pass.`
                    : ' Timer complete. You can click Done now.'
                  : ' Open Instagram to start the countdown.'}
              </p>
            </div>
          </div>

          {previousAttempt?.status === 'rejected' && previousAttempt.review_notes ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">Previous verification needs correction</p>
                  <p className="mt-1">{previousAttempt.review_notes}</p>
                </div>
              </div>
            </div>
          ) : null}

          {feedback ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              {feedback}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{successMessage}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Verification panel</p>
              <p className="mt-1 text-sm text-slate-500">Users only move to the next task after this task is verified correctly.</p>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-200 p-4">
              <label htmlFor={`verification-${task.id}`} className="block text-sm font-medium text-slate-900">
                {instruction.label}
              </label>
              <input
                id={`verification-${task.id}`}
                type="text"
                value={verificationInput}
                onChange={(event) => setVerificationInput(event.target.value)}
                placeholder={instruction.placeholder}
                disabled={isProcessing}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {task.task_type === 'follow'
                  ? 'Example: if the task is for instagram.com/creatorname, enter @creatorname.'
                  : 'Paste the same post or reel URL from the task, without changing it to another Instagram link.'}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-semibold">What happens after approval</p>
              <p className="mt-1">Your points increase by {reward}, this task budget is reduced by {reward}, and the next task becomes available.</p>
            </div>

            <div className={`rounded-2xl p-4 text-sm ${canSubmit ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-100 text-slate-700'}`}>
              <p className="font-semibold">Attempt status</p>
              <p className="mt-1">
                {!openedLink
                  ? 'Done stays disabled until the Instagram link is opened.'
                  : remainingMs > 0
                    ? `Wait ${countdownSeconds}s more before completing this task.`
                    : 'Verification window passed. You can complete this task now.'}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              <span>One task at a time</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
