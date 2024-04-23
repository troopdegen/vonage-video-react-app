import { SessionStorage } from './sessionStorage';

class InMemorySessionStorage implements SessionStorage {
  sessions: { [key: string]: string } = {};
  async getSession(roomName: string): Promise<string | null> {
    return this.sessions[roomName] || null;
  }

  async setSession(roomName: string, sessionId: string): Promise<void> {
    this.sessions[roomName] = sessionId;
  }
}
export default InMemorySessionStorage;
