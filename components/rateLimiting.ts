import { client } from "@/components/redis";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import { NextApiRequest, NextApiResponse } from "next";
import RedisStore from "rate-limit-redis";

const applyMiddleware = (middleware: any) => (request: any, response: any) =>
  new Promise((resolve, reject) => {
    middleware(request, response, (result: any) => (result instanceof Error ? reject(result) : resolve(result)));
  });

export const getIP = (request: any) =>
  request.ip || request.headers["x-forwarded-for"] || request.headers["x-real-ip"] || request.connection.remoteAddress;

export const getRateLimitMiddlewares = ({
  limit = 10,
  windowMs = 60 * 1000,
  delayAfter = 10,
  delayMs = 500,
  store,
  prefix,
}: {
  limit?: number;
  windowMs?: number;
  delayAfter?: number;
  delayMs?: number;
  store: any;
  prefix?: string;
}) => [
  slowDown({
    keyGenerator: prefix ? (request: any) => prefix + getIP(request) : getIP,
    windowMs,
    delayAfter,
    delayMs,
    // fixme: redis
    onLimitReached: (req, res, options) => console.log("onLimitReached slowDown", options, getIP(req)),
  }),
  rateLimit({
    keyGenerator: getIP,
    windowMs,
    max: limit,
    store,
    onLimitReached: (req, res, options) => console.log("onLimitReached rateLimit", options, getIP(req)),
  }),
];

export const createMiddlewares = (opts: any) =>
  getRateLimitMiddlewares({
    ...opts,
    store: new RedisStore({
      prefix: opts.prefix,
      sendCommand: (...args: string[]) => client.sendCommand(args),
    }),
  }).map(applyMiddleware);

type MiddlewareFunc = (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>;

export function runLimiterMiddleware<T>(middlewares: MiddlewareFunc[], req: NextApiRequest, res: NextApiResponse<T>) {
  return Promise.all(middlewares.map((middleware) => middleware(req, res)));
}
