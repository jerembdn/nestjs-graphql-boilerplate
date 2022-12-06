import {
  MongooseOptionsFactory,
  MongooseModuleOptions,
} from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { ConfigService } from "@nestjs/config";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class MongoDBConfigService implements MongooseOptionsFactory {
  private readonly logger = new Logger(MongoDBConfigService.name);

  constructor(private readonly configService: ConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    const dsn: string = this.buildDsn(
      this.configService.get("MONGODB_METHOD"),
      this.configService.get("MONGODB_USERNAME"),
      this.configService.get("MONGODB_PASSWORD"),
      this.configService.get("MONGODB_SERVER_URI"),
      this.configService.get("MONGODB_DATABASE"),
      this.configService.get("MONGODB_PARAMS"),
    );
    this.logger.debug(`Generated DSN : ${dsn}`);

    return {
      uri: dsn,
      connectionFactory: async (connection: Connection) => {
        return connection;
      },
    };
  }

  private buildDsn(
    method: string,
    username: string,
    password: string,
    serverUri: string,
    databaseName: string,
    params: string,
  ): string {
    const paramsArray = params.split(",");

    if (method.includes("srv")) {
      return `${method}://${username}:${password}@${serverUri}/${databaseName}${
        paramsArray && paramsArray.length > 0 && `?${paramsArray.join("&")}`
      }`;
    }

    return `${method}://${serverUri}/${databaseName}${
      paramsArray && paramsArray.length > 0 && `?${paramsArray.join("&")}`
    }`;
  }
}
