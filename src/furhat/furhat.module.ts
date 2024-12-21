import { Module } from '@nestjs/common';
import { FurhatGateway } from './furhat.gateway';

@Module({
    providers: [FurhatGateway]
})
export class FurhatModule { }
