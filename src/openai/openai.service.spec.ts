import { Test, TestingModule } from '@nestjs/testing';
import { OpenAIService } from './openai.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { mockConfigService } from '../../test/mocks/config.service.mock';


jest.mock('axios');

describe('OpenAIService', () => {
  let service: OpenAIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAIService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<OpenAIService>(OpenAIService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call Azure OpenAI Chat Model and return a response', async () => {
    const mockResponse = { data: { choices: [{ message: { content: 'Your fortune is bright!' } }] } };
    (axios.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await service.callChatModel('Tell me my fortune.');
    expect(result).toEqual(mockResponse.data);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('mock-url.com/openai'),
      expect.any(Object),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/Bearer mock-openai-key/),
        }),
      }),
    );
  });
});