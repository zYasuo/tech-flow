import { Express, RequestHandler } from "express";
import { TRouteHandler } from "../../lib/routes";

export function Routes(method: keyof Express, path: string = "", ...middleware: RequestHandler[]) {
    return (target: any, key: string, descriptor: PropertyDescriptor) => {
        const routeHandler: TRouteHandler = Reflect.getMetadata("routeHandler", target.constructor) || new Map();

        if (!routeHandler.has(method)) {
            routeHandler.set(method, new Map());
        }

        routeHandler.get(method)?.set(path, [...middleware, descriptor.value]);

        Reflect.defineMetadata("routeHandler", routeHandler, target.constructor);
    };
}
