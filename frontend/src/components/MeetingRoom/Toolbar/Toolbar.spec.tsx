import { describe, expect, it, vi, beforeEach, Mock, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import useSpeakingDetector from '../../../hooks/useSpeakingDetector';
import Toolbar, { ToolbarProps } from './Toolbar';

const mockedRoomName = { roomName: 'test-room-name' };

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
  useParams: () => mockedRoomName,
}));

vi.mock('../../../hooks/useSpeakingDetector');

const mockUseSpeakingDetector = useSpeakingDetector as Mock<[], boolean>;

describe('Toolbar', () => {
  beforeEach(() => {
    (useLocation as Mock).mockReturnValue({
      state: mockedRoomName,
    });
    mockUseSpeakingDetector.mockReturnValue(false);
  });
  afterAll(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });
  const defaultProps: ToolbarProps = {
    toggleShareScreen: vi.fn(),
    isSharingScreen: false,
    rightPanelActiveTab: 'closed',
    toggleParticipantList: vi.fn(),
    toggleChat: vi.fn(),
    toggleReportIssue: vi.fn(),
    participantCount: 0,
  };

  it('does not render the Report Issue button if it is configured to be disabled', () => {
    vi.stubEnv('VITE_ENABLE_REPORT_ISSUE', 'false');
    render(<Toolbar {...defaultProps} />);
    expect(screen.queryByTestId('report-issue-button')).not.toBeInTheDocument();
  });

  it('does not render the Report Issue button if the configuration is not defined', () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.queryByTestId('report-issue-button')).not.toBeInTheDocument();
  });

  it('renders the Report Issue button if it is configured to be enabled', () => {
    vi.stubEnv('VITE_ENABLE_REPORT_ISSUE', 'true');
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByTestId('report-issue-button')).toBeInTheDocument();
  });
});
