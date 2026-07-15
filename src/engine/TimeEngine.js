const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_MONTH = 30;
const MONTHS_PER_SEASON = 4;
const SEASONS_PER_YEAR = 4;

const TICKS_PER_MINUTE = 1;

const TICKS_PER_HOUR =
    MINUTES_PER_HOUR * TICKS_PER_MINUTE;

const TICKS_PER_DAY =
    HOURS_PER_DAY * TICKS_PER_HOUR;

const TICKS_PER_MONTH =
    DAYS_PER_MONTH * TICKS_PER_DAY;

const TICKS_PER_SEASON =
    MONTHS_PER_SEASON * TICKS_PER_MONTH;

const TICKS_PER_YEAR =
    SEASONS_PER_YEAR * TICKS_PER_SEASON;

class TimeEngine {

    constructor() {

        this.tick = 0;

        console.log("[TimeEngine] Created");

    }

    initialize() {

        console.log("[TimeEngine] Initializing...");

    }

    load() {

        console.log("[TimeEngine] Loading...");

    }

    getTick() {

        return this.tick;

    }

    setTick(tick) {

        this.tick = tick;

    }

    advance(amount = 1) {

        this.tick += amount;

    }

    getTime() {

        const year =
            Math.floor(this.tick / TICKS_PER_YEAR) + 1;

        const yearTick =
            this.tick % TICKS_PER_YEAR;

        const season =
            Math.floor(yearTick / TICKS_PER_SEASON) + 1;

        const seasonTick =
            yearTick % TICKS_PER_SEASON;

        const month =
            Math.floor(seasonTick / TICKS_PER_MONTH) + 1;

        const monthTick =
            seasonTick % TICKS_PER_MONTH;

        const day =
            Math.floor(monthTick / TICKS_PER_DAY) + 1;

        const dayTick =
            monthTick % TICKS_PER_DAY;

        const hour =
            Math.floor(dayTick / TICKS_PER_HOUR);

        const minute =
            dayTick % TICKS_PER_HOUR;

        return {

            tick: this.tick,

            year,

            season,

            month,

            day,

            hour,

            minute

        };

    }

}

module.exports = TimeEngine;