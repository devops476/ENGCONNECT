import { stackServerApp } from "./stack";

async function inspect() {
    console.log("Keys:", Object.keys(stackServerApp));
    const proto = Object.getPrototypeOf(stackServerApp);
    console.log("Proto Keys:", Object.getOwnPropertyNames(proto));

    // Check deeper prototype chain
    let currentProto = proto;
    while (currentProto && currentProto !== Object.prototype) {
        console.log("Proto chain:", Object.getOwnPropertyNames(currentProto));
        currentProto = Object.getPrototypeOf(currentProto);
    }
}

inspect().catch(console.error);
