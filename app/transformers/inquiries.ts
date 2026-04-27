import type { InquiryStatusRecord } from 'app/models/inquiries';

export function transformInquiryStatus(inquiry: {
  id: number;
  status: string;
  updated_at: Date;
}): InquiryStatusRecord {
  return {
    id: inquiry.id,
    status: inquiry.status,
    updated_at: inquiry.updated_at.toISOString(),
  };
}
