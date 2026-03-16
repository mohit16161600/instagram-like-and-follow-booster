ALTER TABLE public.actions
ADD COLUMN status TEXT NOT NULL DEFAULT 'approved'
CHECK (status IN ('approved', 'rejected'));

ALTER TABLE public.actions
ADD COLUMN verification_input TEXT;

ALTER TABLE public.actions
ADD COLUMN review_notes TEXT;

UPDATE public.actions
SET status = 'approved'
WHERE status IS DISTINCT FROM 'approved';
