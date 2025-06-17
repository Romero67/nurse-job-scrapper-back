import { Injectable } from '@nestjs/common';
import { Job } from './schemas/job.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class JobService {
  constructor(@InjectModel(Job.name) private jobModel: Model<Job>) {}

  async findOne(query: any): Promise<Job | null> {
    return await this.jobModel.findOne(query).lean();
  }

  async create(jobData: Partial<Job>): Promise<Job> {
    const createdJob = new this.jobModel(jobData);
    return await createdJob.save();
  }

  async findAll(
    title?: string,
    company?: string,
    location?: string,
    sort?: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<{ jobs: Job[]; total: number }> {
    // Build search query
    const searchQuery: any = {};

    // Add filters if provided
    if (title) {
      searchQuery.title = { $regex: title, $options: 'i' };
    }

    if (company) {
      searchQuery['organization.name'] = { $regex: company, $options: 'i' };
    }

    if (location) {
      searchQuery.$or = [
        { 'location.street': { $regex: location, $options: 'i' } },
        { 'location.locality': { $regex: location, $options: 'i' } },
        { 'location.region': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } },
      ];
    }

    // Build sort options
    let sortOptions: any = { createdAt: -1 }; // Default sort by newest

    if (sort) {
      switch (sort.toLowerCase()) {
        case 'title':
          sortOptions = { title: 1 };
          break;
        case 'title_desc':
          sortOptions = { title: -1 };
          break;
        case 'date':
          sortOptions = { datePosted: -1 };
          break;
        case 'date_asc':
          sortOptions = { datePosted: 1 };
          break;
        case 'salary':
          sortOptions = { 'salary.amount': -1 };
          break;
        case 'salary_asc':
          sortOptions = { 'salary.amount': 1 };
          break;
        case 'company':
          sortOptions = { 'organization.name': 1 };
          break;
        case 'location':
          sortOptions = { 'location.locality': 1, 'location.region': 1 };
          break;
      }
    }

    // Execute queries
    const [jobs, total] = await Promise.all([
      this.jobModel
        .find(searchQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.jobModel.countDocuments(searchQuery),
    ]);

    return { jobs, total };
  }
}
