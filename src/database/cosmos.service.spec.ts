import { Test, TestingModule } from '@nestjs/testing';
import { CosmosService } from './cosmos.service';
import { ConfigService } from '@nestjs/config';
import { mockConfigService } from '../../test/mocks/config.service.mock';
import { Session } from '../types/session.interface';

describe('CosmosService', () => {
  let service: CosmosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CosmosService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CosmosService>(CosmosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a session', async () => {
    const sessionId = '123';
    const mockSession: Session = { id: sessionId };

    jest.spyOn(service, 'createSession').mockResolvedValue(mockSession);

    const result = await service.createSession(sessionId);

    expect(result).toEqual(mockSession);
    expect(service.createSession).toHaveBeenCalledWith(sessionId);
  });

  it('should update a session', async () => {
    const sessionId = '123';
    const existingSession: Session = { id: sessionId, cards: [] };
    const updates: Partial<Session> = { fortune: 'A bright future awaits!' };
    const updatedSession: Session = { ...existingSession, ...updates };

    jest.spyOn(service, 'getSession').mockResolvedValue(existingSession);
    jest.spyOn(service, 'updateSession').mockResolvedValue(updatedSession);

    const result = await service.updateSession(sessionId, updates);

    expect(result).toEqual(updatedSession);
    expect(service.updateSession).toHaveBeenCalledWith(sessionId, updates);
  });

  it('should retrieve a session', async () => {
    const sessionId = '123';
    const mockSession: Session = { id: sessionId, cards: [], fortune: 'A bright future awaits!' };

    jest.spyOn(service, 'getSession').mockResolvedValue(mockSession);

    const result = await service.getSession(sessionId);

    expect(result).toEqual(mockSession);
    expect(service.getSession).toHaveBeenCalledWith(sessionId);
  });

  it('should return null for a non-existent session', async () => {
    const sessionId = 'non-existent';

    jest.spyOn(service, 'getSession').mockResolvedValue(null);

    const result = await service.getSession(sessionId);

    expect(result).toBeNull();
    expect(service.getSession).toHaveBeenCalledWith(sessionId);
  });
});