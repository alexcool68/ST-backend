import schedule from 'node-schedule';

interface jobCreatedInterface {
    status: string;
    job: schedule.Job;
}

export { jobCreatedInterface };
