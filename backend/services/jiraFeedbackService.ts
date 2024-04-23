import axios from 'axios';
import FormData from 'form-data';
import { FeedbackService } from './feedbackService';
import loadConfig from '../helpers/config';
import { Config } from '../types/config';
import { FeedbackData, ReportIssueReturn } from '../types/feedback';

class JiraFeedbackService implements FeedbackService {
  jiraApiUrl: string;
  jiraUrl: string;
  jiraToken: string;
  jiraKey: string;
  jiraComponentId: string;
  jiraEpicUrl: string;
  jiraEpicLink: string;
  config: Config;

  constructor() {
    this.config = loadConfig();
    this.jiraApiUrl = this.config.apiUrl as string;
    this.jiraToken = this.config.token as string;
    this.jiraKey = this.config.key as string;
    this.jiraComponentId = this.config.componentId as string;
    this.jiraUrl = this.config.url as string;
    this.jiraEpicUrl = this.config.epicUrl as string;
    this.jiraEpicLink = this.config.epicLink as string;
  }

  async reportIssue(data: FeedbackData): Promise<ReportIssueReturn | null> {
    const feedbackIssueData = {
      fields: {
        project: {
          key: this.jiraKey,
        },
        summary: data.title,
        description: `Reported by: ${data.name}\n\n Issue description:\n${data.issue}`,
        issuetype: {
          name: 'Bug',
        },
        components: [
          {
            id: this.jiraComponentId,
          },
        ],
        [this.jiraEpicLink]: this.jiraEpicUrl,
      },
    };

    try {
      const response = await axios.post(this.jiraApiUrl, feedbackIssueData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.jiraToken}`,
        },
      });

      const ticketData: ReportIssueReturn = {
        message: 'Your Jira ticket has been created.',
        ticketUrl: `${this.jiraUrl}browse/${response.data.key}`,
      };

      if (!data.attachment) {
        return ticketData;
      }
      return await this.addAttachment(data.attachment, ticketData, response.data.key);
    } catch (error) {
      console.log('Response Error:', error);
      return null;
    }
  }

  private async addAttachment(
    attachment: string,
    ticketData: ReportIssueReturn,
    key: string
  ): Promise<ReportIssueReturn> {
    const fileBuffer = Buffer.from(attachment, 'base64');
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: 'screenshot.png',
      contentType: 'image/png',
    });

    await axios.post(`${this.jiraApiUrl}${key}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Basic ${this.jiraToken}`,
        'X-Atlassian-Token': 'no-check', // required for Jira attachments
        ...formData.getHeaders(),
      },
    });

    return {
      ...ticketData,
      screenshotIncluded: true,
    };
  }
}
export default JiraFeedbackService;
