import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JobLink } from './schemas/jobLink.schema';
import { Model } from 'mongoose';
import puppeteer from 'puppeteer';
import axios from 'axios';
import { load } from 'cheerio';
import { JobService } from 'src/job/job.service';
import { Job } from 'src/job/schemas/job.schema';
import { ScrapperInfo } from './schemas/scrapperInfo.schema';

interface StructureDataJob {
  title: string;
  description: string;
  employmentType: string[];
  directApply: boolean;
  hiringOrganization: {
    name: string;
    sameAs: string;
  };
  jobLocation: {
    address: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
  };
  educationRequirements: [
    {
      credentialCategory: string;
    },
  ];
  experienceRequirements: {
    monthsOfExperience: string;
  };

  workHours: string;
  baseSalary: {
    currency: string;
    value: {
      value: number;
      unitText: string;
    };
  };
  datePosted: string;
}

interface ConfigJobScrapper {
  timeout: number;
  waitPerRequest: number;
}

@Injectable()
export class ScrapperService implements OnModuleInit {
  private logger = new Logger(ScrapperService.name);
  private baseUrl = 'https://www.vivian.com';
  private urlJobs: string =
    '/allied-health/radiology-technologist/travel/pennsylvania/';
  private initialized: boolean = false;

  constructor(
    private readonly config: ConfigService,
    @InjectModel(JobLink.name) private jobLinkModel: Model<JobLink>,
    @InjectModel(ScrapperInfo.name)
    private scrapperInfoModel: Model<ScrapperInfo>,
    private readonly jobService: JobService,
  ) {}

  onModuleInit() {
    if (this.config.get<string>('enable_scrapper') === 'true') {
      this.logger.log('scrapper iniciando...');
      this.initialized = true;
      void this.startScraping();
    } else {
      this.logger.log('scrapper desactivado por defecto');
      this.initialized = false;
    }
  }

  private async scrappeJobLinks(): Promise<void> {
    try {
      this.logger.debug('ScrappeJobLinks init...');
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      });
      const page = await browser.newPage();

      await page.goto(this.baseUrl + this.urlJobs);
      await page.waitForSelector('[data-qa="Job Card"][href]');
      const jobLinks = await page.evaluate(() => {
        const cards = document.querySelectorAll('[data-qa="Job Card"][href]');
        return Array.from(cards).map((card) => card.getAttribute('href'));
      });

      this.logger.debug(`ScrappeJobLinks count links: ${jobLinks.length}`);

      await Promise.all(
        jobLinks.map(async (href) => {
          const exists = await this.jobLinkModel.exists({
            link: this.baseUrl + href,
          });

          if (exists) return;

          await this.jobLinkModel.create({
            link: this.baseUrl + href,
            scrapped: false,
            error: undefined,
          });
        }),
      );

      await browser.close();

      this.logger.debug('ScrappeJobLinks finished');
      return;
    } catch (error) {
      this.logger.error(`scrappeJobLinks - ${error}`);
    }
  }

  private async scrappeJobDetails(): Promise<void> {
    try {
      const links = await this.jobLinkModel.find({ scrapped: false });

      if (!links.length) {
        this.logger.debug('No links to scrape');
      }

      for (const link of links) {
        let error: any = null;

        try {
          const job = await this.jobService.findOne({ link: link.link });

          if (job) continue;

          this.logger.debug(
            `scrappeJobDetails getting job details for ${link.link}`,
          );

          const response = await axios.get(link.link, {
            timeout: this.config.get<ConfigJobScrapper>('jobScrapper')?.timeout,
          });

          if (response.status != 200) {
            this.logger.error(`scrappeJobDetails - ${response.statusText}`);
            continue;
          }

          const $ = load(response.data as string);

          if (!$('[data-qa="Script"]').length) {
            this.logger.error(`scrappeJobDetails - No script found`);
            continue;
          }

          const jsonData = JSON.parse(
            $('[data-qa="Script"]').text(),
          ) as StructureDataJob;

          await this.jobService.create(
            this.getDataFromJson(jsonData, link.link),
          );
        } catch (err) {
          this.logger.error(`scrappeJobDetails - link ${link.link} - ${err}`);
          error = err;
        }

        this.jobLinkModel.updateOne({ _id: link._id }, { scrapped: true });

        if (error) {
          await this.jobLinkModel.updateOne({ _id: link._id }, { error });
        }

        await new Promise((resolve) =>
          setTimeout(
            resolve,
            this.config.get<ConfigJobScrapper>('jobScrapper')?.waitPerRequest,
          ),
        );
      }
      this.logger.debug('ScrappeJobDetails finished');
    } catch (err) {
      this.logger.error(`scrappeJobDetails - ${err}`);
    }
  }

  async getLastUpdate(): Promise<string> {
    const lastUpdated = await this.scrapperInfoModel.findOne({ _id: 'unique' });
    return lastUpdated
      ? lastUpdated.lastUpdated
          .toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
          .replace(',', '')
      : 'No updates yet';
  }

  async startScraping(): Promise<void> {
    try {
      await this.scrapperInfoModel.updateOne(
        { _id: 'unique' },
        { lastUpdated: new Date() },
        { upsert: true },
      );
      await this.scrappeJobLinks();
      await this.scrappeJobDetails();
    } catch (error) {
      console.error('Error al iniciar el scrapper:', error);
    }
  }

  private getDataFromJson(jsonData: StructureDataJob, link: string): Job {
    return {
      title:
        jsonData.title && jsonData.title.trim() !== ''
          ? jsonData.title.trim()
          : '',
      description:
        jsonData.description && jsonData.description.trim() !== ''
          ? jsonData.description.trim()
          : '',
      link: link,
      employmentType: jsonData.employmentType ? jsonData.employmentType : [],
      directApply: jsonData.directApply || false,
      organization: {
        name:
          jsonData.hiringOrganization?.name &&
          jsonData.hiringOrganization.name.trim() !== ''
            ? jsonData.hiringOrganization.name.trim()
            : '',
        url:
          jsonData.hiringOrganization?.sameAs &&
          jsonData.hiringOrganization.sameAs.trim() !== ''
            ? jsonData.hiringOrganization.sameAs.trim()
            : '',
      },
      location: {
        street:
          jsonData.jobLocation?.address?.streetAddress &&
          jsonData.jobLocation.address.streetAddress.trim() !== ''
            ? jsonData.jobLocation.address.streetAddress.trim()
            : '',
        locality:
          jsonData.jobLocation?.address?.addressLocality &&
          jsonData.jobLocation.address.addressLocality.trim() !== ''
            ? jsonData.jobLocation.address.addressLocality.trim()
            : '',
        region:
          jsonData.jobLocation?.address?.addressRegion &&
          jsonData.jobLocation.address.addressRegion.trim() !== ''
            ? jsonData.jobLocation.address.addressRegion.trim()
            : '',
        postalCode:
          jsonData.jobLocation?.address?.postalCode &&
          jsonData.jobLocation.address.postalCode.trim() !== ''
            ? jsonData.jobLocation.address.postalCode.trim()
            : '',
        country:
          jsonData.jobLocation?.address?.addressCountry &&
          jsonData.jobLocation.address.addressCountry.trim() !== ''
            ? jsonData.jobLocation.address.addressCountry.trim()
            : '',
      },
      educationRequirements: Array.isArray(jsonData.educationRequirements)
        ? jsonData.educationRequirements
            .filter(
              (x) =>
                x?.credentialCategory && x.credentialCategory.trim() !== '',
            )
            .map((x) => x.credentialCategory.trim())
        : [],
      experienceRequirements:
        jsonData.experienceRequirements?.monthsOfExperience &&
        jsonData.experienceRequirements.monthsOfExperience.trim() !== ''
          ? jsonData.experienceRequirements.monthsOfExperience.trim() +
            ' months'
          : '',
      workHours:
        jsonData.workHours && jsonData.workHours.trim() !== ''
          ? jsonData.workHours.trim()
          : '',
      salary: {
        amount: jsonData.baseSalary?.value?.value || 0,
        currency:
          jsonData.baseSalary?.currency &&
          jsonData.baseSalary.currency.trim() !== ''
            ? jsonData.baseSalary.currency.trim()
            : '',
        unit:
          jsonData.baseSalary?.value?.unitText &&
          jsonData.baseSalary.value.unitText.trim() !== ''
            ? jsonData.baseSalary.value.unitText.trim()
            : '',
      },
      datePosted:
        jsonData.datePosted && jsonData.datePosted.trim() !== ''
          ? new Date(jsonData.datePosted.trim())
          : undefined,
    };
  }
}
