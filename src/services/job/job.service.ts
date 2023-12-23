import schedule, { scheduledJobs } from 'node-schedule';

import { jobCreatedInterface } from './job.interface';

class JobService {
    constructor() {}

    static cancel(name: string) {
        const currentJob = scheduledJobs[name];

        if (!currentJob) return { error: `Unable to find job ${name}` };

        const stopped = currentJob.cancel();

        if (!stopped) return { error: `Unable to stop ${name}` };

        return { status: 'success', name };
    }

    static jobExist(name: string): boolean {
        if (name in scheduledJobs) {
            return true;
        } else {
            return false;
        }
    }

    static create(
        name: string,
        rule: string | number | schedule.RecurrenceSpecDateRange | schedule.RecurrenceSpecObjLit | Date,
        callback: schedule.JobCallback,
    ): jobCreatedInterface {
        const job = schedule.scheduleJob(name, rule, callback);
        return { status: 'success', job };
    }
}

export default JobService;
