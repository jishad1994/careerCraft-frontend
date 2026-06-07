import { baseUrl } from "./api-endpoints.constants";

export const PUBLIC_API_ENDPOINTS = {
    JOBS: {
        GET_JOBS: `${baseUrl}/api/jobs`,

        GET_FEATURED_JOBS: `${baseUrl}/api/jobs/featured`,

        SEARCH_JOBS: `${baseUrl}/api/jobs/search`,

        GET_JOBS_BY_SLUG: (slug: string) => `${baseUrl}/api/jobs/slug/${slug}`,

        GET_JOBS_BY_ID: (jobId: string) => `${baseUrl}/api/jobs/${jobId}`,
    },
};
