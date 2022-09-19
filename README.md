# github-push-redeploy

Small utility webserver to redeploy another server upon Github push.

In order to function properly, it needs a `.env` file with the following items:

`PORT`: What port the web server should run on.
`GITHUB_WEBHOOK_REDEPLOY_ENDPOINT`: What server endpoint the Github webhook request should go to.
`GITHUB_WEBHOOK_SECRET`: The secret set up in the Github webhook request.
`REDEPLOY_SCRIPT_ABSOLUTE_PATH`: An absolute path to the bash script which performs the server redeploy.
`HAS_AWS_SNS_EMAIL_NOTIFICATION`: Use `true` if you want email notifications for failed deployments, skip if you don't want them. Needs to have an Amazon AWS SNS (Simple Notification Service) already set up in order to work.
`AWS_REGION` and `AWS_ALERT_ARN`: Identifying information for the Amazon AWS SNS notification.

**Note:** The Github webhook needs to be sending the POST request with the `application/json` format in order for this repo to work.
