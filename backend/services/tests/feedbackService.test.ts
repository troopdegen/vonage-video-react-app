import { describe, expect, it } from '@jest/globals';
import { FeedbackService } from '../feedbackService';
import JiraFeedbackService from '../jiraFeedbackService';

describe('getFeedbackService', () => {
  it('should return JiraFeedbackService when asking for a service', async () => {
    const { default: getFeedbackService } = await import('../getFeedbackService');

    const feedbackService: FeedbackService = getFeedbackService();

    expect(feedbackService).toBeInstanceOf(JiraFeedbackService);
  });
});
