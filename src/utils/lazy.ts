import { lazy } from "react";

export function lazyWithDelay(
    importFunc: () => Promise<any>,
    delay = 1000
) {
    return lazy(() =>
        Promise.all([
            importFunc(),
            new Promise((resolve) => setTimeout(resolve, delay)),
        ]).then(([moduleExports]) => moduleExports)
    );
}
