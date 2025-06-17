export default () => ({
  port: process.env.PORT || 3000,
  enable_scrapper: process.env.ENABLE_SCRAPPER || 'true',
  db_uri: process.env.DB_URI || 'mongodb://mongodb:27017/nurse-job-scrapper',
  jobScrapper: {
    timeout: process.env.JOB_SCRAPPER_TIMEOUT || 1000 * 5,
    waitPerRequest: process.env.JOB_SCRAPPER_WAIT_PER_REQUEST || 1000 * 2,
  },
});
