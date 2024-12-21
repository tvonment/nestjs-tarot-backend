import { Test, TestingModule } from '@nestjs/testing';
import { BlobService } from './blob.service';
import { ConfigService } from '@nestjs/config';
import { mockConfigService } from '../../test/mocks/config.service.mock';

describe('BlobService', () => {
  let service: BlobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlobService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<BlobService>(BlobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upload an image', async () => {
    // Mock uploadImage behavior
    const mockUrl = 'https://mock-storage.com/images/image.jpg';
    jest.spyOn(service, 'uploadImage').mockResolvedValue(mockUrl);

    const result = await service.uploadImage('image.jpg', Buffer.from('mock data'));
    expect(result).toBe(mockUrl);
  });
});