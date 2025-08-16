export function Controller(baseRoute: string = "") {
    return function (target: Function) {
        Reflect.defineMetadata("baseRoute", baseRoute, target);
    };
}
