import JobService from '@/services/job/job.service';
// import Logger from '@/utils/winston';

class fetchStatsJob {
    public name = 'fetchStats';

    public rule = '0 * * * *'; //every 1 hour !
    // public rule = '*/30 * * * *'; //Every 30 minutes
    // public rule = '*/15 * * * *'; //every 10 seconds

    // private readonly TwitterService = new TwitterService();

    constructor() {
        this.initialiseJob();
    }

    get jobNameFormat() {
        return `[${this.name}Job]`;
    }

    private callback = async (): Promise<any> => {
        // const { twitters } = await this.TwitterService.getTwitters();
        // if (!twitters) throw new Error(`Cant add stats on twitters`);
        // const usernames = twitters.map((twitter: any) => twitter.username);
        // const { status, errors } = await this.TwitterService.fetchAndInsertStatAndUpdateByUsernames(usernames, 100);
        // if (status) Logger.info(`${this.jobNameFormat} - ${status}`);
        // if (errors) Logger.error(`${this.jobNameFormat} - ${errors}`);
    };

    private initialiseJob = () => {
        const { job } = JobService.create(this.name, this.rule, this.callback);

        return job;
    };
}

export default fetchStatsJob;
