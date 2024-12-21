import { Test, TestingModule } from '@nestjs/testing';
import { FurhatGateway } from './furhat.gateway';
import { OpenAIService } from '../openai/openai.service';

const mockOpenAIService = {
  callChatModel: jest.fn(() => Promise.resolve({ choices: [{ message: { content: 'Your fortune is bright!' } }] })),
};

describe('FurhatGateway', () => {
  let gateway: FurhatGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FurhatGateway,
        { provide: OpenAIService, useValue: mockOpenAIService },
      ],
    }).compile();

    gateway = module.get<FurhatGateway>(FurhatGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle fortuneRequest and return a response', async () => {
    const result = await gateway.handleFortuneRequest({ message: 'Tell me my fortune.' });
    expect(result).toBe('Your fortune is bright!');
    expect(mockOpenAIService.callChatModel).toHaveBeenCalledWith('Tell me my fortune.');
  });
});