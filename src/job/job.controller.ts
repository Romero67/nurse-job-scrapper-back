import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiQuery, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobService } from './job.service';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  @ApiOperation({ summary: 'Find all jobs with optional filters' })
  @ApiResponse({ status: 200, description: 'List of jobs with pagination' })
  @ApiQuery({
    name: 'title',
    required: false,
    description: 'Filter by job title',
  })
  @ApiQuery({
    name: 'company',
    required: false,
    description: 'Filter by company name',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location (street, locality, region, country)',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description:
      'Sort by: title, title_desc, date, date_asc, salary, salary_asc, company, location',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Number of records to skip for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return (max 100)',
  })
  async findAll(
    @Query('title') title?: string,
    @Query('company') company?: string,
    @Query('location') location?: string,
    @Query('sort') sort?: string,
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 20) : 0;
    const limitNum = limit ? parseInt(limit, 20) : 20;

    // Validate skip and limit
    if (isNaN(skipNum) || skipNum < 0) {
      throw new BadRequestException('Skip must be a non-negative number');
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const result = await this.jobService.findAll(
      title,
      company,
      location,
      sort,
      skipNum,
      limitNum,
    );

    return {
      data: result.jobs,
      pagination: {
        skip: skipNum,
        limit: limitNum,
        total: result.total,
        hasNext: skipNum + limitNum < result.total,
        hasPrev: skipNum > 0,
      },
    };
  }
}
