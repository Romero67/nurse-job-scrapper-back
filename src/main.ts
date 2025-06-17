import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Nurse Job Scrapper')
    .setDescription(
      'Nurse Job Scrapper API, scrapping and parsing job listings, filtering and sorting, and storing them in a database, and a user interface ',
    )
    .setVersion('1.0')
    .addTag('scrapping')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const configService = app.get(ConfigService);
  const port = Number(configService.get('port'));

  await app.listen(port);
}
bootstrap();
