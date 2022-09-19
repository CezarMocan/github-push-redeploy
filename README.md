# github-push-redeploy

Small utility webserver to redeploy another server upon Github push.

## Configuration

1. Clone this repository on the server that is managing your redeploys.
2. Run `npm install` and `npm run build`.
3. Add an `.env` file with the following items:

* `PORT`: What port the web server should run on.
* `GITHUB_WEBHOOK_REDEPLOY_ENDPOINT`: What server endpoint the Github webhook request should go to. This is the `Payload URL` configured in the Github Webhook.
* `GITHUB_WEBHOOK_SECRET`: The `Secret` set up in the Github Webhook.
* `REDEPLOY_SCRIPT_ABSOLUTE_PATH`: An absolute path to the bash script which performs the server redeploy.
* `HAS_AWS_SNS_EMAIL_NOTIFICATION`: Use `true` if you want email notifications for failed deployments, skip or set to `false` if you don't want them. Needs to have an Amazon AWS SNS (Simple Notification Service) already set up in order to work.
* `AWS_REGION` and `AWS_ALERT_ARN`: Identifying information for the Amazon AWS SNS notification.
* **Important Note:** The Github webhook needs to be sending the POST request with the `application/json` format in order for this repo to work.

4. Start this web server with `pm2`: `pm2 start dist/index.js --name Project_Github_Webhook_Redeploy`.
