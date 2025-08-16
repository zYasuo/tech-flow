import { Express, RequestHandler } from "express";

export type TRouteHandler = Map<keyof Express, Map<string, RequestHandler[]>>;
