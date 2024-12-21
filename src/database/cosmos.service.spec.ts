import { Test, TestingModule } from '@nestjs/testing';
import { CosmosService } from './cosmos.service';
import { ConfigService } from '@nestjs/config';
import { mockConfigService } from '../../test/mocks/config.service.mock';

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

  it('should save and retrieve a session', async () => {
    const session = { sessionId: '123', data: 'test' };

    jest.spyOn(service, 'saveSession').mockResolvedValue();
    jest.spyOn(service, 'getSession').mockResolvedValue(session);

    await service.saveSession(session);
    const result = await service.getSession('123');
    expect(result).toEqual(session);
  });
});