import Vue from 'vue';
import BaseEvent from './../utils/BaseEvent';

export const SplashType = {
    INIT: "init",
    RESET: "reset",
    PROGRESS: "progress",
    COMPLETE: "complete",
}

class Splash extends BaseEvent {
    constructor() {
        super();
    }

    init(total: number) {
        this.emit(SplashType.INIT, total);
    }

    reset(text: string) {
        this.emit(SplashType.RESET, text);
    }

    progress(step: number, text: number) {
        this.emit(SplashType.PROGRESS, step, text);
    }

    complete(text: string) {
        this.emit(SplashType.COMPLETE, text);
    }
}

export default {
    install(Vue: any) {
        Vue.prototype.splash = new Splash();
    }
}
