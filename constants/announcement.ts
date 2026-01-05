/**
 * 공지사항 설정
 * EAS Update로 새 공지를 추가하려면 id만 변경하면 됩니다.
 * 예: 'feedback-request-v1' → 'feedback-request-v2'
 */
export const CURRENT_ANNOUNCEMENT = {
  id: 'feedback-request-v1',
  titleKey: 'announcement.feedbackRequest.title',
  messageKey: 'announcement.feedbackRequest.message',
  copyEmailKey: 'announcement.feedbackRequest.copyEmail',
  emailCopiedKey: 'announcement.feedbackRequest.emailCopied',
  email: 'contact@hyson.kr',
} as const;
