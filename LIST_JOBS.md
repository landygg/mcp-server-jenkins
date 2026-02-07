# List Jenkins Jobs Script

This script connects to your Jenkins server and lists all available jobs.

## Usage

Simply run:

```bash
npm run list-jobs
```

Or directly:

```bash
node list-jobs.js
```

## Configuration

The script automatically loads configuration from your `.env` file:
- `JENKINS_URL` - Your Jenkins server URL
- `JENKINS_USERNAME` - Your Jenkins username
- `JENKINS_PASSWORD` or `JENKINS_API_TOKEN` - Your credentials
- `JENKINS_TIMEOUT` (optional) - Request timeout in seconds
- `JENKINS_VERIFY_SSL` (optional) - SSL verification (default: true)

## Output

The script will display:
- All Jenkins jobs grouped by type (WorkflowJob, FreeStyleProject, etc.)
- Status indicators (🟢 success, 🔴 failed, 🟡 unstable, etc.)
- Whether each job is buildable
- Direct URLs to each job

## Example Output

```
✓ Loaded configuration from .env file

🔍 Connecting to Jenkins: https://cicd.bsmartech.com
📡 Fetching all jobs...

✓ Found 15 Jenkins items

====================================================================================================

📋 WorkflowJob (10 items)
----------------------------------------------------------------------------------------------------

  🟢 my-pipeline-job
     Buildable: ✓ Yes
     Status: blue
     URL: https://cicd.bsmartech.com/job/my-pipeline-job/

...

====================================================================================================

📊 Summary: 15 total items

Breakdown by type:
  • WorkflowJob: 10
  • FreeStyleProject: 5
```
