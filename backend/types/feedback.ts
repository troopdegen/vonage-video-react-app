export type FeedbackData = {
  title: string;
  name: string;
  issue: string;
  attachment: string;
};

export type ReportIssueReturn = {
  message: string;
  ticketUrl: string;
  screenshotIncluded?: boolean;
};
