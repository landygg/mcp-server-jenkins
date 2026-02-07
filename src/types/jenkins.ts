/**
 * Configuration for Jenkins connection
 */
export interface JenkinsConfig {
  url: string;
  username?: string;
  password?: string;
  timeout?: number;
  verifySSL?: boolean;
}

/**
 * Jenkins Item (Job or Folder)
 */
export interface JenkinsItem {
  _class: string;
  name: string;
  fullName: string;
  url: string;
  color?: string;
  buildable?: boolean;
  builds?: JenkinsBuild[];
  lastBuild?: JenkinsBuild;
  lastSuccessfulBuild?: JenkinsBuild;
  lastFailedBuild?: JenkinsBuild;
}

/**
 * Jenkins Build
 */
export interface JenkinsBuild {
  _class: string;
  number: number;
  url: string;
  result?: string;
  building?: boolean;
  duration?: number;
  timestamp?: number;
  fullDisplayName?: string;
  displayName?: string;
}

/**
 * Jenkins Queue Item
 */
export interface JenkinsQueueItem {
  id: number;
  task: {
    name: string;
    url: string;
  };
  why?: string;
  blocked?: boolean;
  buildable?: boolean;
  stuck?: boolean;
}

/**
 * Jenkins Node
 */
export interface JenkinsNode {
  displayName: string;
  description?: string;
  numExecutors: number;
  offline: boolean;
  temporarilyOffline?: boolean;
}
