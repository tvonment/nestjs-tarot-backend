import { Test, TestingModule } from '@nestjs/testing';
import { CosmosService } from './cosmos.service';
import { ConfigService } from '@nestjs/config';
import { mockConfigService } from '../../test/mocks/config.service.mock';
import { Session } from '../types/session.interface';
import { ItemResponse } from '@azure/cosmos';

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
    const mockSession: Session = { id: '123', topic: 'career', cards: [], fortune: null };

    const cosmosResponse = {
      ...mockSession,
      _rid: 'abc',
      _ts: 1234567890,
      _self: '/dbs/abc/colls/xyz/docs/123',
      _etag: 'etag123',
    }; // Full mocked Cosmos DB response with required Resource properties

    jest.spyOn(service['client'].database(service['databaseId']).container(service['containerId']).items, 'create')
      .mockResolvedValue({
        resource: cosmosResponse,
        headers: {},
        statusCode: 201,
        substatusCode: 0,
        requestCharge: 1,
        activityId: 'some-activity-id',
        diagnostics: {},
        item: cosmosResponse,
        etag: 'etag123', // Ensure this field is included to satisfy ItemResponse
      } as unknown as ItemResponse<Session>); // Cast to 'unknown' first

    const result = await service.createSession(mockSession);

    expect(result).toEqual(mockSession); // Expect only the mapped session to be returned
  });

  it('should update a session', async () => {
    const sessionId = '123';
    const existingSession: Session = { id: sessionId, topic: 'career', cards: [], fortune: null };
    const updates: Partial<Session> = { fortune: 'A bright future awaits!' };
    const updatedSession: Session = { ...existingSession, ...updates };

    const cosmosResponse = { ...updatedSession, _rid: 'abc', _ts: 1234567890 }; // Mocked Cosmos DB response

    const mockItem = {
      read: jest.fn().mockResolvedValue({ resource: { ...existingSession, _rid: 'xyz' } }),
      replace: jest.fn().mockResolvedValue({ resource: cosmosResponse }),
    };

    jest.spyOn(service['client'].database(service['databaseId']).container(service['containerId']), 'item')
      .mockReturnValue(mockItem as any);

    const result = await service.updateSession(sessionId, updates);

    expect(result).toEqual(updatedSession); // Expect only the mapped session to be returned
    expect(mockItem.read).toHaveBeenCalled();
    expect(mockItem.replace).toHaveBeenCalledWith(expect.objectContaining(updatedSession));
  });

  it('should retrieve a session', async () => {
    const sessionId = '123';
    const mockSession: Session = { id: sessionId, topic: 'career', cards: [], fortune: 'A bright future awaits!' };

    const cosmosResponse = { ...mockSession, _rid: 'abc', _ts: 1234567890 }; // Mocked Cosmos DB response

    const mockItem = {
      read: jest.fn().mockResolvedValue({ resource: cosmosResponse }),
    };

    jest.spyOn(service['client'].database(service['databaseId']).container(service['containerId']), 'item')
      .mockReturnValue(mockItem as any);

    const result = await service.getSession(sessionId);

    expect(result).toEqual(mockSession); // Expect only the mapped session to be returned
    expect(mockItem.read).toHaveBeenCalled();
  });

  it('should return null for a non-existent session', async () => {
    const sessionId = 'non-existent';

    const mockItem = {
      read: jest.fn().mockRejectedValue({ code: 404 }),
    };

    jest.spyOn(service['client'].database(service['databaseId']).container(service['containerId']), 'item')
      .mockReturnValue(mockItem as any);

    const result = await service.getSession(sessionId);

    expect(result).toBeNull();
    expect(mockItem.read).toHaveBeenCalled();
  });

  it('should throw an error for other exceptions', async () => {
    const sessionId = 'error-session';

    const mockItem = {
      read: jest.fn().mockRejectedValue(new Error('Unexpected error')),
    };

    jest.spyOn(service['client'].database(service['databaseId']).container(service['containerId']), 'item')
      .mockReturnValue(mockItem as any);

    await expect(service.getSession(sessionId)).rejects.toThrow('Unexpected error');
    expect(mockItem.read).toHaveBeenCalled();
  });
});