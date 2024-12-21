import { Test, TestingModule } from '@nestjs/testing';
import { FurhatGateway } from './furhat.gateway';

describe('FurhatGateway', () => {
  let gateway: FurhatGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FurhatGateway],
    }).compile();

    gateway = module.get<FurhatGateway>(FurhatGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
