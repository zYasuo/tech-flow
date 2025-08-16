import { Express, RequestHandler } from "express";

export function RegisterControllers(app: Express, controllers: any[]) {
    controllers.forEach((controller) => {
        const instance = typeof controller === "function" ? new controller() : controller;
        let baseRoute: string = Reflect.getMetadata("baseRoute", instance.constructor) || "";
        const routeHandler: Map<string, Map<string, RequestHandler[]>> = Reflect.getMetadata("routeHandler", instance.constructor) || new Map();

        if (!baseRoute.startsWith("/")) {
            baseRoute = "/" + baseRoute;
        }

        routeHandler.forEach((handlersMap: Map<string, RequestHandler[]>, method: string) => {
            handlersMap.forEach((handlers: RequestHandler[], path: string) => {
                const fullPath = `/api/v1${baseRoute}${path}`;
                const boundHandlers = handlers.map((handler) => {
                    if (typeof handler === "function") {
                        return handler.bind(instance);
                    }
                    return handler;
                });

                (app as any)[method](fullPath, ...boundHandlers);
                console.log(`Route registered: [${method.toUpperCase()}] ${fullPath}`);
            });
        });
    });
}
