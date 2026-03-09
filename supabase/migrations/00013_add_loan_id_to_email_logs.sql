-- 返却依頼メール送信履歴を貸出レコードと紐づけるため、loan_id を追加
ALTER TABLE public.email_logs
  ADD COLUMN loan_id UUID REFERENCES public.loans (id) ON DELETE SET NULL;

CREATE INDEX idx_email_logs_loan_id ON public.email_logs (loan_id);

COMMENT ON COLUMN public.email_logs.loan_id IS '返却依頼メール（kind=return_request）の場合、対象の貸出ID';
