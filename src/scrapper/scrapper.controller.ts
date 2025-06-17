import { Controller, Get } from '@nestjs/common';
import { ScrapperService } from './scrapper.service';

@Controller('scrapper')
export class ScrapperController {
  constructor(private readonly scrapperService: ScrapperService) {}

  @Get('/last-update')
  async getLastUpdate(): Promise<{ date: string }> {
    return {
      date: await this.scrapperService.getLastUpdate(),
    };
  }
}
