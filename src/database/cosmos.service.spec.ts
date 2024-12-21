import { Test, TestingModule } from '@nestjs/testing';
import { CosmosService } from './cosmos.service';

describe('CosmosService', () => {
  let service: CosmosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CosmosService],
    }).compile();

    service = module.get<CosmosService>(CosmosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
