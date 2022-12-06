import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import {
  DateTimeResolver,
  EmailAddressResolver,
  UnsignedIntResolver,
} from "graphql-scalars";
import { GraphQLJSONObject } from "graphql-type-json";
import { join } from "path";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import { MongooseModule } from "@nestjs/mongoose";

import { MongoDBConfigService } from "../../config/database/mongodb.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === "production"
          ? [".env", ".env.production"]
          : [
              ".env",
              ".env.development",
              ".env.local",
              ".env.development.local",
            ],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useClass: MongoDBConfigService,
      inject: [ConfigService],
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      useFactory: async (): Promise<ApolloDriverConfig> => ({
        subscriptions: {
          "graphql-ws": true,
        },
        path: "/",
        typePaths: ["./**/*.graphql"],
        resolvers: {
          DateTime: DateTimeResolver,
          EmailAddress: EmailAddressResolver,
          UnsignedInt: UnsignedIntResolver,
          JSONObject: GraphQLJSONObject,
        },
        definitions: {
          path: join(__dirname, "graphql.ts"),
        },
        debug: true,
        installSubscriptionHandlers: true,
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
        playground: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        context: ({ req, res }): any => ({ req, res }),
      }),
    }),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
